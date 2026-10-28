local MODELS = {
    male = joaat('mp_m_freemode_01'),
    female = joaat('mp_f_freemode_01')
}

local VALID_SECTIONS = {
    headBlend = true, faceFeatures = true, eyeColor = true,
    hair = true, overlays = true, components = true, props = true
}

local TURN_OFFSETS = { front = 0.0, profile = 90.0, back = 180.0 }

local Creator = {
    active = false,
    beginning = false,
    mode = nil,
    slot = nil,
    gender = 'male',
    heading = 0.0,
    cam = nil,
    cameraPreset = 'body',
    cameraOrbit = 0.0,
    zoom = 0.0,
    floor = nil,
    poseId = nil,
    parentsShown = false,
    pendingAppearance = nil,
    pendingSet = {},
    pendingAll = false,
    changingModel = false,
    submitting = false,
    originalAppearance = nil,
    pendingOutfitName = nil,
    skinCameraForward = nil,
    radarHidden = false,
    sessionId = 0,
    submitToken = 0
}

local Parents = { mother = nil, father = nil, cache = {}, busy = false }

local SUBMIT_TIMEOUT_MS = 20000

local ERROR_TEXT = {
    rate_limited = 'Zwolnij trochę.',
    invalid_slot = 'Nieprawidłowy slot.',
    slot_occupied = 'Ten slot jest już zajęty.',
    has_active_character = 'Masz już aktywną postać.',
    player_not_found = 'Nie znaleziono profilu gracza.',
    core_unavailable = 'mono_core jest niedostępny.',
    timeout = 'Serwer nie odpowiedział.',
    invalid_eye_color = 'Ten kolor oczu jest niedostępny.',
    scene_failed = 'Nie udało się przygotować sceny kreatora.'
}

local function Notify(text)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandThefeedPostTicker(false, true)
end

local function Clamp(value, low, high)
    return math.max(low, math.min(high, value))
end

local function CurrentScene()
    return Config.Scene
end

local function SceneVectors(scene)
    local radians = math.rad(scene.heading)

    return -math.sin(radians), math.cos(radians), math.cos(radians), math.sin(radians)
end

-- ---------------------------------------------------------------------
-- Scena
-- ---------------------------------------------------------------------

local function FadeOut(ms)
    DoScreenFadeOut(ms)

    local deadline = GetGameTimer() + 3000

    while not IsScreenFadedOut() and GetGameTimer() < deadline do
        Wait(10)
    end
end

local function PlacePed(ped)
    local scene = CurrentScene()

    SetEntityCoords(ped, scene.x, scene.y, Creator.floor or scene.z, false, false, false, false)
    SetEntityHeading(ped, Creator.heading)
    ClearPedTasksImmediately(ped)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
end

local function LoadScene(scene)
    local ped = PlayerPedId()

    SetFocusPosAndVel(scene.x, scene.y, scene.z, 0.0, 0.0, 0.0)
    NewLoadSceneStartSphere(scene.x, scene.y, scene.z, 120.0, 0)

    local deadline = GetGameTimer() + 8000

    while not IsNewLoadSceneLoaded() and GetGameTimer() < deadline do
        Wait(50)
    end

    NewLoadSceneStop()

    FreezeEntityPosition(ped, false)
    SetEntityCoords(ped, scene.x, scene.y, scene.z + 1.0, false, false, false, false)

    deadline = GetGameTimer() + 8000

    while not HasCollisionLoadedAroundEntity(ped) and GetGameTimer() < deadline do
        RequestCollisionAtCoord(scene.x, scene.y, scene.z)
        Wait(50)
    end

    local floor = scene.z

    for _ = 1, 20 do
        RequestCollisionAtCoord(scene.x, scene.y, scene.z)

        local found, groundZ = GetGroundZFor_3dCoord(scene.x, scene.y, scene.z + 1.5, false)

        if found then
            if math.abs(groundZ - scene.z) <= 3.0 then
                floor = groundZ
            end

            break
        end

        Wait(50)
    end

    Creator.floor = floor
end

local function ApplyAtmosphere(scene)
    NetworkOverrideClockTime(math.floor(scene.hour or 18), 0, 0)
    SetOverrideWeather(scene.weather or 'CLEAR')
end

local function ClearAtmosphere()
    NetworkClearClockTimeOverride()
    ClearOverrideWeather()
    ClearWeatherTypePersist()
end

-- ---------------------------------------------------------------------
-- Pozy
-- ---------------------------------------------------------------------

local function FindPose(id)
    for _, pose in ipairs(Config.Poses) do
        if pose.id == id then
            return pose
        end
    end

    return Config.Poses[1]
end

local function ApplyPose(id)
    local pose = FindPose(id or Config.DefaultPose)

    if not pose then
        return
    end

    Creator.poseId = pose.id

    local ped = PlayerPedId()

    ClearPedTasksImmediately(ped)

    if pose.scenario then
        TaskStartScenarioInPlace(ped, pose.scenario, 0, false)
    elseif pose.dict and pose.clip then
        RequestAnimDict(pose.dict)

        local deadline = GetGameTimer() + 3000

        while not HasAnimDictLoaded(pose.dict) and GetGameTimer() < deadline do
            Wait(20)
        end

        if HasAnimDictLoaded(pose.dict) then
            TaskPlayAnim(ped, pose.dict, pose.clip, 4.0, -4.0, -1, 1, 0.0, false, false, false)
        end
    end

    SetEntityHeading(ped, Creator.heading)
end

local function ChangeModel(gender)
    local hash = MODELS[gender]

    if not hash then
        return false
    end

    RequestModel(hash)

    local deadline = GetGameTimer() + 10000

    while not HasModelLoaded(hash) and GetGameTimer() < deadline do
        Wait(50)
    end

    if not HasModelLoaded(hash) then
        return false
    end

    SetPlayerModel(PlayerId(), hash)
    SetModelAsNoLongerNeeded(hash)

    Wait(100)

    local ped = PlayerPedId()

    SetPedDefaultComponentVariation(ped)

    Creator.gender = gender

    PlacePed(ped)

    return true
end

-- ---------------------------------------------------------------------
-- Kamera
-- ---------------------------------------------------------------------

local function CameraParams(presetName)
    local preset = Config.Camera[presetName] or Config.Camera.body

    if Creator.mode == 'skin' then
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        local forward = Creator.skinCameraForward or GetEntityForwardVector(ped)
        local forwardX, forwardY = forward.x, forward.y
        if Creator.wardrobeMode then
            local angle = math.rad(Creator.cameraOrbit or 0.0)
            local cosAngle, sinAngle = math.cos(angle), math.sin(angle)
            forwardX, forwardY = forwardX * cosAngle - forwardY * sinAngle,
                forwardX * sinAngle + forwardY * cosAngle
        end

        local leftX, leftY = forwardY, -forwardX
        local shift = (Config.CameraShift or 0.0) * (preset.dist / 2.6)
        local head = GetPedBoneCoords(ped, 0x796e, 0.0, 0.0, 0.0) -- SKEL_Head
        local leftFoot = GetPedBoneCoords(ped, 0x3779, 0.0, 0.0, 0.0) -- SKEL_L_Foot
        local rightFoot = GetPedBoneCoords(ped, 0xcc4d, 0.0, 0.0, 0.0) -- SKEL_R_Foot
        local footZ = math.min(leftFoot.z, rightFoot.z)
        local pedHeight = head.z - footZ
        local baseZ = footZ

        if pedHeight < 1.2 or pedHeight > 2.3 then
            local minDim, maxDim = GetModelDimensions(GetEntityModel(ped))
            pedHeight = maxDim.z - minDim.z
            baseZ = coords.z
        end

        if pedHeight < 1.2 or pedHeight > 2.3 then
            pedHeight = 1.8
        end

        if baseZ ~= baseZ or math.abs(baseZ) > 10000.0 then
            baseZ = coords.z
        end

        local heightScale = pedHeight / 1.8
        local cameraDistance = preset.dist
        local cameraHeight = preset.camZ * heightScale
        local lookHeight = preset.lookZ * heightScale
        local cameraFov = preset.fov

        if presetName == 'body' then
            cameraDistance = math.max(preset.dist, pedHeight * 1.95)
            lookHeight = pedHeight * 0.48
            cameraHeight = lookHeight + (preset.camZ - preset.lookZ) * heightScale
            cameraFov = math.max(preset.fov, 48.0)
        end

        local shiftMultiplier = 1.45
        if presetName == 'face' then
            shiftMultiplier = 1.15
        elseif presetName == 'faceClose' then
            shiftMultiplier = 1.05
        end

        shift = (Config.CameraShift or 0.0) * shiftMultiplier * (cameraDistance / 2.6)

        return
            coords.x + forwardX * cameraDistance + leftX * shift,
            coords.y + forwardY * cameraDistance + leftY * shift,
            baseZ + cameraHeight,
            coords.x + leftX * shift,
            coords.y + leftY * shift,
            baseZ + lookHeight,
            cameraFov,
            cameraDistance
    end

    local scene = CurrentScene()
    local floor = Creator.floor or scene.z

    local forwardX, forwardY, leftX, leftY = SceneVectors(scene)
    local shift = (Config.CameraShift or 0.0) * (preset.dist / 2.6)

    return
        scene.x + forwardX * preset.dist + leftX * shift,
        scene.y + forwardY * preset.dist + leftY * shift,
        floor + preset.camZ,
        scene.x + leftX * shift,
        scene.y + leftY * shift,
        floor + preset.lookZ,
        preset.fov,
        preset.dist
end

local function ConfigureCam(cam, preset, fov, distance)
    SetCamFov(cam, (fov or preset.fov) + Creator.zoom)

    local dof = Config.DepthOfField

    if dof and dof.Enabled then
        SetCamUseShallowDofMode(cam, true)
        local focusDistance = distance or preset.dist
        SetCamNearDof(cam, math.max(focusDistance - dof.Before, 0.1))
        SetCamFarDof(cam, focusDistance + dof.After)
        SetCamDofStrength(cam, dof.Strength)
    end
end

local function SetupCamera(presetName)
    local preset = Config.Camera[presetName] and presetName or 'body'
    local camX, camY, camZ, lookX, lookY, lookZ, fov, distance = CameraParams(preset)

    Creator.cameraPreset = preset
    Creator.zoom = 0.0
    Creator.cam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', camX, camY, camZ, 0.0, 0.0, 0.0, fov, false, 2)

    PointCamAtCoord(Creator.cam, lookX, lookY, lookZ)
    ConfigureCam(Creator.cam, Config.Camera[preset], fov, distance)
    SetCamActive(Creator.cam, true)
    RenderScriptCams(true, false, 0, true, false)
end

local function MoveCamera(presetName)
    if not Creator.cam or not Config.Camera[presetName] then
        return
    end

    Creator.cameraPreset = presetName
    Creator.zoom = 0.0

    local camX, camY, camZ, lookX, lookY, lookZ, fov, distance = CameraParams(presetName)
    local newCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', camX, camY, camZ, 0.0, 0.0, 0.0, fov, false, 2)

    PointCamAtCoord(newCam, lookX, lookY, lookZ)
    ConfigureCam(newCam, Config.Camera[presetName], fov, distance)
    SetCamActiveWithInterp(newCam, Creator.cam, 450, 1, 1)

    local oldCam = Creator.cam

    Creator.cam = newCam

    SetTimeout(600, function()
        if DoesCamExist(oldCam) then
            DestroyCam(oldCam, false)
        end
    end)
end

local function OrbitWardrobeCamera(delta)
    if not Creator.active or not Creator.wardrobeMode or not Creator.cam then
        return
    end

    Creator.cameraOrbit = ((Creator.cameraOrbit + delta) % 360.0 + 360.0) % 360.0

    local camX, camY, camZ, lookX, lookY, lookZ, fov, distance = CameraParams(Creator.cameraPreset)
    SetCamCoord(Creator.cam, camX, camY, camZ)
    PointCamAtCoord(Creator.cam, lookX, lookY, lookZ)
    ConfigureCam(Creator.cam, Config.Camera[Creator.cameraPreset], fov, distance)
end

local function DrawStudioLights()
    local scene = CurrentScene()
    local floor = Creator.floor or scene.z
    local forwardX, forwardY, leftX, leftY = SceneVectors(scene)

    for _, light in ipairs(Config.Lights or {}) do
        DrawLightWithRange(
            scene.x + forwardX * light.Forward + leftX * light.Side,
            scene.y + forwardY * light.Forward + leftY * light.Side,
            floor + light.Height,
            light.Color[1], light.Color[2], light.Color[3],
            light.Range, light.Intensity
        )
    end
end

local PARENT_MODEL = { mother = joaat('mp_f_freemode_01'), father = joaat('mp_m_freemode_01') }

local function ParentSlot(role)
    local scene = CurrentScene()
    local forwardX, forwardY, leftX, leftY = SceneVectors(scene)
    local cfg = Config.Parents
    local side = role == 'mother' and 1.0 or -1.0

    return
        scene.x + leftX * cfg.Spread * side - forwardX * cfg.Back,
        scene.y + leftY * cfg.Spread * side - forwardY * cfg.Back,
        Creator.floor or scene.z,
        (scene.heading + (role == 'mother' and 12.0 or -12.0)) % 360.0
end

local function LoadModel(hash)
    RequestModel(hash)

    local deadline = GetGameTimer() + 8000

    while not HasModelLoaded(hash) and GetGameTimer() < deadline do
        Wait(25)
    end

    return HasModelLoaded(hash)
end

local function EnsureParent(role)
    while Parents.busy do
        Wait(10)
    end

    local ped = Parents[role]

    if ped and DoesEntityExist(ped) then
        return ped
    end

    Parents.busy = true

    local hash = PARENT_MODEL[role]

    if not LoadModel(hash) then
        Parents.busy = false

        return nil
    end

    local x, y, z, heading = ParentSlot(role)

    ped = CreatePed(4, hash, x, y, z, heading, false, false)

    SetModelAsNoLongerNeeded(hash)

    if not ped or ped == 0 then
        Parents.busy = false

        return nil
    end

    SetEntityVisible(ped, false, false)
    SetEntityInvincible(ped, true)
    SetEntityCollision(ped, false, false)
    FreezeEntityPosition(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetPedDefaultComponentVariation(ped)

    Parents[role] = ped
    Parents.cache[role] = nil
    Parents.busy = false

    return ped
end

local function UpdateParent(role, data)
    if type(data) ~= 'table' then
        return
    end

    local ped = EnsureParent(role)

    if not ped then
        return
    end

    local shape = Clamp(math.tointeger(tonumber(data.shape)) or 0, 0, 45)
    local skin = Clamp(math.tointeger(tonumber(data.skin)) or 0, 0, 45)
    local key = shape .. ':' .. skin

    if Parents.cache[role] == key then
        return
    end

    Parents.cache[role] = key

    SetPedHeadBlendData(ped, shape, shape, 0, skin, skin, 0, 0.0, 0.0, 0.0, false)

    local deadline = GetGameTimer() + 3000

    while not HasPedHeadBlendFinished(ped) and GetGameTimer() < deadline do
        Wait(10)
    end
end

local function SetParentsVisible(visible)
    for _, role in ipairs({ 'mother', 'father' }) do
        local ped = Parents[role]

        if ped and DoesEntityExist(ped) then
            SetEntityVisible(ped, visible, false)
        end
    end
end

local function DeleteParents()
    for _, role in ipairs({ 'mother', 'father' }) do
        local ped = Parents[role]

        if ped and DoesEntityExist(ped) then
            DeleteEntity(ped)
        end

        Parents[role] = nil
    end

    Parents.cache = {}
    Creator.parentsShown = false
end

-- ---------------------------------------------------------------------
-- Dane dla NUI (limity zaleza od modelu i DLC, wiec liczy je klient)
-- ---------------------------------------------------------------------

local function BuildPalette(count, getter)
    local palette = {}

    for index = 0, math.min(count, 64) - 1 do
        local ok, r, g, b = pcall(getter, index)

        if ok and r then
            palette[#palette + 1] = { r, g, b }
        else
            palette[#palette + 1] = { 128, 128, 128 }
        end
    end

    return palette
end

local function BuildLimits(ped, definitions)
    local limits = {
        hair = GetNumberOfPedDrawableVariations(ped, 2),
        overlays = {},
        components = {},
        props = {}
    }

    for _, overlay in ipairs(definitions.overlays) do
        limits.overlays[overlay.key] = GetPedHeadOverlayNum(overlay.id)
    end

    for _, id in ipairs(definitions.components) do
        limits.components[tostring(id)] = GetNumberOfPedDrawableVariations(ped, id)
    end

    for _, id in ipairs(definitions.props) do
        limits.props[tostring(id)] = GetNumberOfPedPropDrawableVariations(ped, id)
    end

    return limits
end

local function BuildColors()
    return {
        hair = BuildPalette(GetNumHairColors(), function(index)
            return GetPedHairRgbColor(index)
        end),
        makeup = BuildPalette(GetNumMakeupColors(), function(index)
            return GetPedMakeupRgbColor(index)
        end)
    }
end

local function BuildLabels(list)
    local labels = {}

    for _, item in ipairs(list) do
        labels[#labels + 1] = { id = item.id, label = item.label }
    end

    return labels
end

-- ---------------------------------------------------------------------
-- Cykl zycia
-- ---------------------------------------------------------------------

local function Teardown(keepSkinAppearance)
    local wasActive = Creator.active
    local wasSkin = Creator.mode == 'skin'

    Creator.active = false
    Creator.changingModel = false
    Creator.pendingAppearance = nil
    Creator.pendingSet = {}
    Creator.pendingAll = false

    if wasSkin and not keepSkinAppearance and Creator.originalAppearance then
        pcall(function()
            exports.mono_appearance:ApplyToPed(PlayerPedId(), Creator.originalAppearance)
        end)
    end

    RenderScriptCams(false, false, 0, true, false)
    DestroyAllCams(true)

    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })

    DeleteParents()
    if not wasSkin then ClearAtmosphere() end

    local ped = PlayerPedId()

    if not wasSkin then ClearPedTasksImmediately(ped) end
    FreezeEntityPosition(ped, false)
    SetEntityInvincible(ped, false)

    if wasActive then
        DisplayRadar(not Creator.radarHidden)
    end

    ClearFocus()
    Creator.mode = nil
    Creator.wardrobeMode = false
    Creator.cameraOrbit = 0.0
    Creator.originalAppearance = nil
    Creator.pendingOutfitName = nil
    Creator.skinCameraForward = nil
end

local function Finish(result)
    result = result or {}
    Teardown(result.skinSaved == true)

    Creator.beginning = false
    Creator.submitting = false

    result.slot = Creator.slot

    if not result.created then
        TriggerServerEvent('mono_creator:cancel')
    end

    TriggerEvent('mono_creator:closed', result)
end

local function StartSkinEditor(data)
    local ped = PlayerPedId()
    local gender = data.gender

    if Creator.active or Creator.beginning then
        TriggerServerEvent('mono_creator:skinCancel')
        return Notify('Kreator jest już otwarty.')
    end
    if (gender ~= 'male' and gender ~= 'female') or type(data.appearance) ~= 'table' then return end
    if GetEntityModel(ped) ~= MODELS[gender] or IsEntityDead(ped) or IsPedInAnyVehicle(ped, false) then
        TriggerServerEvent('mono_creator:skinCancel')
        return Notify('Nie można teraz otworzyć edytora wyglądu.')
    end

    Creator.mode = 'skin'
    Creator.wardrobeMode = data.mode == 'wardrobe'
    Creator.cameraOrbit = 0.0
    Creator.active = true
    Creator.beginning = false
    Creator.slot = nil
    Creator.gender = gender
    Creator.heading = GetEntityHeading(ped)
    local cameraForward = GetEntityForwardVector(ped)
    Creator.skinCameraForward = vector2(cameraForward.x, cameraForward.y)
    Creator.floor = GetEntityCoords(ped).z
    Creator.radarHidden = IsRadarHidden()
    Creator.originalAppearance = data.appearance
    Creator.pendingAppearance = nil
    Creator.pendingSet = {}
    Creator.pendingAll = false
    Creator.submitting = false

    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    DisplayRadar(false)
    SetupCamera('body')

    SendNUIMessage({
        action = 'open',
        mode = Creator.wardrobeMode and 'wardrobe' or 'skin',
        gender = gender,
        appearance = data.appearance,
        limits = BuildLimits(ped, exports.mono_appearance:GetDefinitions()),
        colors = BuildColors(),
        poses = {},
        parentsEnabled = false
    })

    SetNuiFocus(true, true)

    CreateThread(function()
        while Creator.active do
            local pending = Creator.pendingAppearance

            if pending and not Creator.changingModel then
                local sections = (not Creator.pendingAll) and Creator.pendingSet or nil
                Creator.pendingAppearance = nil
                Creator.pendingSet = {}
                Creator.pendingAll = false

                if sections and next(sections) == nil then sections = nil end
                exports.mono_appearance:ApplyToPed(PlayerPedId(), pending, sections)
            else
                Wait(30)
            end
        end
    end)

    CreateThread(function()
        while Creator.active do
            HideHudAndRadarThisFrame()
            DisableAllControlActions(0)
            if Creator.mode ~= 'skin' then DrawStudioLights() end
            Wait(0)
        end
    end)
end

local function StartScene(settings)
    Creator.active = true
    Creator.heading = CurrentScene().heading
    Creator.gender = 'male'
    Creator.radarHidden = IsRadarHidden()
    Creator.pendingAppearance = nil
    Creator.pendingSet = {}
    Creator.pendingAll = false

    DisplayRadar(false)

    FadeOut(400)

    local scene = CurrentScene()

    LoadScene(scene)

    if not ChangeModel('male') then
        DoScreenFadeIn(300)
        Notify(ERROR_TEXT.scene_failed)

        return Finish({ created = false })
    end

    local definitions = exports.mono_appearance:GetDefinitions()
    local appearance = exports.mono_appearance:GetDefaultAppearance('male')
    local ped = PlayerPedId()

    exports.mono_appearance:ApplyToPed(ped, appearance)

    ApplyAtmosphere(scene)
    ApplyPose(Config.DefaultPose)
    SetupCamera('body')

    SendNUIMessage({
        action = 'open',
        slot = Creator.slot,
        settings = settings,
        gender = 'male',
        appearance = appearance,
        limits = BuildLimits(ped, definitions),
        colors = BuildColors(),
        poses = BuildLabels(Config.Poses),
        poseId = Creator.poseId,
        parentsEnabled = Config.Parents.Enabled and true or false
    })

    SetNuiFocus(true, true)

    DoScreenFadeIn(500)

    CreateThread(function()
        while Creator.active do
            local pending = Creator.pendingAppearance

            if pending and not Creator.changingModel then
                local sections = (not Creator.pendingAll) and Creator.pendingSet or nil

                Creator.pendingAppearance = nil
                Creator.pendingSet = {}
                Creator.pendingAll = false

                if sections and next(sections) == nil then
                    sections = nil
                end

                exports.mono_appearance:ApplyToPed(PlayerPedId(), pending, sections)
            else
                Wait(30)
            end
        end
    end)

    CreateThread(function()
        while Creator.active do
            HideHudAndRadarThisFrame()
            DisableAllControlActions(0)
            DrawStudioLights()

            Wait(0)
        end
    end)
end

AddEventHandler('mono_creator:open', function(slot)
    if Creator.active or Creator.beginning then
        return
    end

    Creator.beginning = true
    Creator.mode = 'create'
    Creator.slot = slot
    Creator.sessionId = Creator.sessionId + 1

    local sessionId = Creator.sessionId

    TriggerServerEvent('mono_creator:begin', slot)

    SetTimeout(8000, function()
        if Creator.sessionId == sessionId and Creator.beginning and not Creator.active then
            Notify(ERROR_TEXT.timeout)

            Finish({ created = false })
        end
    end)
end)

RegisterNetEvent('mono_creator:began', function(slot, settings)
    if not Creator.beginning or Creator.active or slot ~= Creator.slot then
        return
    end

    CreateThread(function()
        StartScene(settings)
    end)
end)

RegisterNetEvent('mono_creator:openSkin', function(data)
    if type(data) ~= 'table' then return end
    StartSkinEditor(data)
end)

RegisterNetEvent('mono_creator:commandResult', function(ok, message)
    if type(message) == 'string' then Notify(message) end
end)

RegisterNetEvent('mono_creator:beginFailed', function(errorCode)
    if not Creator.beginning then
        return
    end

    Notify(ERROR_TEXT[errorCode] or ('Nie można otworzyć kreatora: ' .. tostring(errorCode)))

    Finish({ created = false })
end)

RegisterNetEvent('mono_creator:submitResult', function(ok, errorCode, character)
    if not Creator.active then
        return
    end

    Creator.submitting = false

    if ok and type(character) == 'table' then
        return Finish({ created = true, character = character })
    end

    SendNUIMessage({ action = 'submitResult', ok = false, error = errorCode })
end)

RegisterNetEvent('mono_creator:skinSubmitResult', function(ok, errorCode)
    if not Creator.active or Creator.mode ~= 'skin' then return end

    Creator.submitting = false

    if ok then
        if Creator.wardrobeMode and Creator.pendingOutfitName then
            TriggerEvent('pd_job:client:saveCurrentOutfit', Creator.pendingOutfitName)
        else
            Notify('Wygląd postaci został zapisany.')
        end
        return Finish({ skinSaved = true })
    end

    SendNUIMessage({ action = 'submitResult', ok = false, error = errorCode or 'internal_error' })
end)

-- ---------------------------------------------------------------------
-- Callbacki NUI
-- ---------------------------------------------------------------------

RegisterNUICallback('preview', function(data, cb)
    -- Podczas zmiany modelu ignorujemy podglady - to stare dane z poprzedniej plci.
    if Creator.active and not Creator.changingModel and type(data) == 'table' and type(data.appearance) == 'table' then
        local added = false

        if type(data.sections) == 'table' then
            for _, name in ipairs(data.sections) do
                if VALID_SECTIONS[name] then
                    Creator.pendingSet[name] = true
                    added = true
                end
            end
        end

        if not added then
            Creator.pendingAll = true
        end

        Creator.pendingAppearance = data.appearance
    end

    cb({ ok = true })
end)

RegisterNUICallback('setGender', function(data, cb)
    local gender = data and data.gender

    if not Creator.active or Creator.changingModel or (gender ~= 'male' and gender ~= 'female') then
        return cb({ ok = false })
    end

    Creator.changingModel = true
    Creator.pendingAppearance = nil
    Creator.pendingSet = {}
    Creator.pendingAll = false

    CreateThread(function()
        local changed = ChangeModel(gender)

        if not changed then
            Creator.changingModel = false

            return cb({ ok = false })
        end

        local appearance = exports.mono_appearance:GetDefaultAppearance(gender)
        local ped = PlayerPedId()

        exports.mono_appearance:ApplyToPed(ped, appearance)
        ApplyPose(Creator.poseId)

        local limits = BuildLimits(ped, exports.mono_appearance:GetDefinitions())

        Creator.changingModel = false

        cb({ ok = true, appearance = appearance, limits = limits })
    end)
end)

-- Ile tekstur ma dany wariant ubrania / propa (zalezy od modelu i DLC).
RegisterNUICallback('getTextures', function(data, cb)
    if not Creator.active or type(data) ~= 'table' then
        return cb({ count = 1 })
    end

    local id = math.tointeger(tonumber(data.id))
    local drawable = math.tointeger(tonumber(data.drawable))

    if not id or not drawable or drawable < 0 then
        return cb({ count = 1 })
    end

    local ped = PlayerPedId()
    local count

    if data.kind == 'prop' then
        count = GetNumberOfPedPropTextureVariations(ped, id, drawable)
    else
        count = GetNumberOfPedTextureVariations(ped, id, drawable)
    end

    cb({ count = math.max(count or 1, 1) })
end)

RegisterNUICallback('camera', function(data, cb)
    if Creator.active and type(data) == 'table' and type(data.preset) == 'string' then
        MoveCamera(data.preset)
    end

    cb({ ok = true })
end)

RegisterNUICallback('orbitCamera', function(data, cb)
    local delta = tonumber(data and data.delta)

    if delta and delta == delta then
        OrbitWardrobeCamera(Clamp(delta, -45.0, 45.0))
    end

    cb({ ok = true })
end)

RegisterNUICallback('zoom', function(data, cb)
    local delta = tonumber(data and data.delta)

    if Creator.active and Creator.mode ~= 'skin' and Creator.cam and delta and delta == delta then
        local preset = Config.Camera[Creator.cameraPreset]

        Creator.zoom = Clamp(Creator.zoom + Clamp(delta, -4.0, 4.0), -14.0, 10.0)

        SetCamFov(Creator.cam, preset.fov + Creator.zoom)
    end

    cb({ ok = true })
end)

RegisterNUICallback('rotate', function(data, cb)
    local delta = tonumber(data and data.delta)

    if Creator.active and delta and delta == delta then
        delta = math.max(-90.0, math.min(90.0, delta + 0.0))

        Creator.heading = (Creator.heading + delta) % 360.0

        SetEntityHeading(PlayerPedId(), Creator.heading)
    end

    cb({ ok = true })
end)

RegisterNUICallback('turn', function(data, cb)
    local offset = TURN_OFFSETS[data and data.preset]

    if Creator.active and offset then
        Creator.heading = (CurrentScene().heading + offset) % 360.0

        SetEntityHeading(PlayerPedId(), Creator.heading)
    end

    cb({ ok = true })
end)

RegisterNUICallback('pose', function(data, cb)
    if Creator.active and not Creator.changingModel and type(data) == 'table' and type(data.id) == 'string' then
        CreateThread(function()
            ApplyPose(data.id)
        end)
    end

    cb({ ok = true })
end)

RegisterNUICallback('parents', function(data, cb)
    cb({ ok = true })

    if not Creator.active or not Config.Parents.Enabled or type(data) ~= 'table' then
        return
    end

    Creator.parentsShown = data.show == true

    if not Creator.parentsShown then
        return SetParentsVisible(false)
    end

    CreateThread(function()
        UpdateParent('mother', data.mother)
        UpdateParent('father', data.father)

        -- Stan "pokaz" mogl sie zmienic w trakcie ladowania modeli.
        SetParentsVisible(Creator.parentsShown and Creator.active)
    end)
end)

RegisterNUICallback('submit', function(data, cb)
    if not Creator.active or Creator.submitting or type(data) ~= 'table' then
        return cb({ ok = false })
    end

    if Creator.wardrobeMode then
        local outfitName = type(data.outfitName) == 'string' and data.outfitName:gsub('^%s*(.-)%s*$', '%1') or ''
        local nameLength = utf8 and utf8.len and utf8.len(outfitName) or #outfitName
        if outfitName == '' or not nameLength or nameLength > 24 then
            return cb({ ok = false, error = 'invalid_outfit_name' })
        end
        Creator.pendingOutfitName = outfitName
    else
        Creator.pendingOutfitName = nil
    end

    Creator.submitting = true
    Creator.submitToken = Creator.submitToken + 1

    local token = Creator.submitToken

    if Creator.mode == 'skin' then
        TriggerServerEvent('mono_creator:skinSubmit', data.appearance)

        SetTimeout(SUBMIT_TIMEOUT_MS, function()
            if Creator.active and Creator.mode == 'skin' and Creator.submitting and Creator.submitToken == token then
                Creator.submitting = false
                SendNUIMessage({ action = 'submitResult', ok = false, error = 'timeout' })
            end
        end)

        return cb({ ok = true })
    end

    TriggerServerEvent('mono_creator:submit', {
        identity = data.identity,
        appearance = data.appearance
    })

    SetTimeout(SUBMIT_TIMEOUT_MS, function()
        if Creator.active and Creator.submitting and Creator.submitToken == token then
            Creator.submitting = false

            SendNUIMessage({ action = 'submitResult', ok = false, error = 'timeout' })
        end
    end)

    cb({ ok = true })
end)

RegisterNUICallback('cancel', function(_, cb)
    if Creator.active then
        Finish({ created = false })
    end

    cb({ ok = true })
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end

    if Creator.active then
        Teardown()
    end
end)

if Config.Debug then
    RegisterCommand('mono_scene', function()
        local coords = GetEntityCoords(PlayerPedId())
        local heading = (GetGameplayCamRot(2).z + 180.0) % 360.0

        print(('[MONO_CREATOR] Config.Scene = { label = \'Molo Del Perro\', x = %.4f, y = %.4f, z = %.2f, heading = %.1f, hour = 18, weather = \'EXTRASUNNY\' }')
            :format(coords.x, coords.y, coords.z - 1.0, heading))
    end, false)
end
