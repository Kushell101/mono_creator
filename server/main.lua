local PREFIX = '[MONO_CREATOR]'

local creating = {} -- [src] = { slot = n }
local busy = {}
local lastBegin = {}
local skinEditing = {}

local BEGIN_COOLDOWN_MS = 1000

local function Log(message)
    print(('%s %s'):format(PREFIX, message))
end

local function ToInteger(value)
    local number = tonumber(value)

    return number and math.tointeger(number)
end

local function CommandReply(src, ok, message)
    if tonumber(src) == 0 then
        return Log(message)
    end

    TriggerClientEvent('mono_creator:commandResult', src, ok == true, message)
end

RegisterCommand('skin', function(rawSource, args)
    local src = tonumber(rawSource) or 0

    local okPermission, allowed = pcall(function()
        return exports.mono_core:HasPermission(src, 'command.skin')
    end)

    if not okPermission or not allowed then
        return CommandReply(src, false, 'Nie masz uprawnień do komendy /skin.')
    end

    local target = ToInteger(args and args[1])
    if not target or target < 1 then
        return CommandReply(src, false, 'Użycie: /skin [ID gracza]')
    end

    if not GetPlayerName(target) then
        return CommandReply(src, false, ('Nie znaleziono gracza o ID %d.'):format(target))
    end

    if skinEditing[target] and (os.time() - skinEditing[target].startedAt) <= (Config.SessionTimeout or 1800) then
        return CommandReply(src, false, 'Ten gracz ma już otwarty edytor wyglądu.')
    end

    if creating[target] or busy[target] then
        return CommandReply(src, false, 'Ten gracz jest już w trakcie innej operacji kreatora.')
    end

    local okCharacter, character = pcall(function()
        return exports.mono_core:GetActiveCharacter(target)
    end)

    if not okCharacter or type(character) ~= 'table' or not character.id
        or (character.gender ~= 'male' and character.gender ~= 'female') then
        return CommandReply(src, false, 'Gracz nie ma obecnie aktywnej postaci.')
    end

    local characterId = ToInteger(character.id)
    if not characterId or characterId < 1 then
        return CommandReply(src, false, 'Aktywna postać ma nieprawidłowe ID.')
    end

    local okAppearance, result = pcall(function()
        return exports.mono_appearance:GetCharacterAppearance(character.id, character.gender)
    end)

    if not okAppearance or type(result) ~= 'table' or not result.ok or type(result.appearance) ~= 'table' then
        return CommandReply(src, false, 'Nie udało się pobrać wyglądu tej postaci.')
    end

    skinEditing[target] = {
        characterId = characterId,
        gender = character.gender,
        startedAt = os.time(),
        requestedBy = src
    }

    TriggerClientEvent('mono_creator:openSkin', target, {
        appearance = result.appearance,
        gender = character.gender
    })

    CommandReply(src, true, ('Uruchomiono edytor wyglądu dla gracza %d.'):format(target))
end, false)

RegisterNetEvent('mono_creator:requestWardrobe', function()
    local src = source
    local ped = GetPlayerPed(src)
    if not ped or ped == 0 or not DoesEntityExist(ped) then return end

    local coords = GetEntityCoords(ped)
    if #(coords - vector3(450.092, -994.302, 30.630)) > 3.0 then
        return TriggerClientEvent('pd_job:client:notify', src, 'Podejdź do punktu szatni.')
    end

    local okCharacter, character = pcall(function()
        return exports.mono_core:GetActiveCharacter(src)
    end)
    if not okCharacter or type(character) ~= 'table' or not character.id
        or (character.gender ~= 'male' and character.gender ~= 'female') then
        return TriggerClientEvent('pd_job:client:notify', src, 'Nie znaleziono aktywnej postaci.')
    end

    local okMember, isMember = pcall(function()
        return MySQL.scalar.await('SELECT 1 FROM pd_job_members WHERE character_id = ? LIMIT 1', { character.id })
    end)
    if not okMember or not isMember then
        return TriggerClientEvent('pd_job:client:notify', src, 'Szatnia jest dostępna tylko dla funkcjonariuszy PD.')
    end

    if skinEditing[src] and (os.time() - skinEditing[src].startedAt) <= (Config.SessionTimeout or 1800) then
        return TriggerClientEvent('pd_job:client:notify', src, 'Edytor wyglądu jest już otwarty.')
    end
    if creating[src] or busy[src] then
        return TriggerClientEvent('pd_job:client:notify', src, 'Zakończ najpierw trwającą operację kreatora.')
    end

    local okAppearance, result = pcall(function()
        return exports.mono_appearance:GetCharacterAppearance(character.id, character.gender)
    end)
    if not okAppearance or type(result) ~= 'table' or not result.ok or type(result.appearance) ~= 'table' then
        return TriggerClientEvent('pd_job:client:notify', src, 'Nie udało się wczytać aktualnego stroju.')
    end

    skinEditing[src] = {
        characterId = ToInteger(character.id),
        gender = character.gender,
        startedAt = os.time(),
        requestedBy = src,
        mode = 'wardrobe'
    }
    TriggerClientEvent('mono_creator:openSkin', src, {
        appearance = result.appearance,
        gender = character.gender,
        mode = 'wardrobe'
    })
end)

local function EnterBucket(src, session)
    local cfg = Config.RoutingBucket

    if not cfg or not cfg.Enabled then
        return
    end

    if session.previousBucket == nil then
        session.previousBucket = GetPlayerRoutingBucket(src)
    end

    local bucket = cfg.Base + src

    SetRoutingBucketPopulationEnabled(bucket, false)
    SetPlayerRoutingBucket(src, bucket)
end

local function LeaveBucket(src, session)
    if not session or session.previousBucket == nil then
        return
    end

    if GetPlayerName(src) then
        SetPlayerRoutingBucket(src, session.previousBucket)
    end

    session.previousBucket = nil
end

local function EndSession(src)
    local session = creating[src]

    if session then
        LeaveBucket(src, session)
    end

    creating[src] = nil
end

-- ---------------------------------------------------------------------
-- Walidacja tozsamosci
-- ---------------------------------------------------------------------

local LOWER_TO_UPPER = {
    ['ą'] = 'Ą', ['ć'] = 'Ć', ['ę'] = 'Ę', ['ł'] = 'Ł', ['ń'] = 'Ń',
    ['ó'] = 'Ó', ['ś'] = 'Ś', ['ź'] = 'Ź', ['ż'] = 'Ż'
}

local UPPER_TO_LOWER = {}

for lower, upper in pairs(LOWER_TO_UPPER) do
    UPPER_TO_LOWER[upper] = lower
end

local function IsAsciiLetter(code)
    return (code >= 65 and code <= 90) or (code >= 97 and code <= 122)
end

-- Zwraca imie z poprawna wielkoscia liter ("jAN-kowalski" -> "Jan-Kowalski") albo nil.
local function CleanName(value)
    if type(value) ~= 'string' then
        return nil
    end

    value = value:match('^%s*(.-)%s*$')

    local length = utf8.len(value)

    if not length or length < Config.Name.Min or length > Config.Name.Max then
        return nil
    end

    local out = {}
    local newWord = true

    for _, code in utf8.codes(value) do
        local char = utf8.char(code)

        if char == '-' then
            if newWord then
                return nil
            end

            out[#out + 1] = char
            newWord = true
        elseif IsAsciiLetter(code) or LOWER_TO_UPPER[char] or UPPER_TO_LOWER[char] then
            if newWord then
                out[#out + 1] = LOWER_TO_UPPER[char] or char:upper()
            else
                out[#out + 1] = UPPER_TO_LOWER[char] or char:lower()
            end

            newWord = false
        else
            return nil
        end
    end

    if newWord then
        return nil
    end

    return table.concat(out)
end

local function CheckBirthDate(value)
    if type(value) ~= 'string' then
        return nil, 'invalid_birthdate'
    end

    local year, month, day = value:match('^(%d%d%d%d)%-(%d%d)%-(%d%d)$')

    if not year then
        return nil, 'invalid_birthdate'
    end

    year, month, day = tonumber(year), tonumber(month), tonumber(day)

    local now = os.date('*t')
    local age = now.year - year

    if now.month < month or (now.month == month and now.day < day) then
        age = age - 1
    end

    if age < Config.Age.Min then
        return nil, 'age_too_young'
    end

    if age > Config.Age.Max then
        return nil, 'age_too_old'
    end

    return value
end

-- ---------------------------------------------------------------------
-- Tworzenie postaci
-- ---------------------------------------------------------------------

local function Submit(src, session, data)
    local identity = data.identity

    if type(identity) ~= 'table' then
        return nil, 'missing_data'
    end

    local gender = identity.gender

    if gender ~= 'male' and gender ~= 'female' then
        return nil, 'invalid_gender'
    end

    local firstName = CleanName(identity.firstName)

    if not firstName then
        return nil, 'invalid_first_name'
    end

    local lastName = CleanName(identity.lastName)

    if not lastName then
        return nil, 'invalid_last_name'
    end

    local birthDate, birthError = CheckBirthDate(identity.dateOfBirth)

    if not birthDate then
        return nil, birthError
    end

    local normalized = exports.mono_appearance:NormalizeAppearance(data.appearance, gender)

    if not normalized or not normalized.ok then
        return nil, normalized and normalized.error or 'invalid_appearance'
    end

    local eyeColor = normalized.appearance.eyeColor

    if Config.MaxEyeColor and eyeColor and eyeColor.color > Config.MaxEyeColor then
        return nil, 'invalid_eye_color'
    end

    if exports.mono_core:GetActiveCharacter(src) then
        return nil, 'has_active_character'
    end

    local created = exports.mono_core:CreateCharacter(
        src,
        session.slot,
        firstName,
        lastName,
        birthDate,
        gender
    )

    if not created or not created.id then
        return nil, created and created.error or 'database_error'
    end

    local okSave, saved = pcall(function()
        return exports.mono_appearance:SaveAppearance(created.id, gender, normalized.appearance)
    end)

    if not okSave or not saved or not saved.ok then
        pcall(function()
            exports.mono_core:DeleteCharacter(src, created.id)
        end)

        return nil, (okSave and saved and saved.error) or 'database_error'
    end

    return {
        id = created.id,
        slot = session.slot,
        first_name = firstName,
        last_name = lastName,
        date_of_birth = birthDate,
        gender = gender
    }
end

RegisterNetEvent('mono_creator:begin', function(slot)
    local src = source

    local function fail(code)
        TriggerClientEvent('mono_creator:beginFailed', src, code)
    end

    local now = GetGameTimer()

    if lastBegin[src] and (now - lastBegin[src]) < BEGIN_COOLDOWN_MS then
        return fail('rate_limited')
    end

    lastBegin[src] = now

    slot = ToInteger(slot)

    if not slot or slot < 1 then
        return fail('invalid_slot')
    end

    local okActive, active = pcall(function()
        return exports.mono_core:GetActiveCharacter(src)
    end)

    if not okActive then
        return fail('core_unavailable')
    end

    if active then
        return fail('has_active_character')
    end

    local characters = exports.mono_core:GetCharacters(src)

    if not characters then
        return fail('player_not_found')
    end

    for _, character in ipairs(characters) do
        if tonumber(character.slot) == slot then
            return fail('slot_occupied')
        end
    end

    local previousBucket = creating[src] and creating[src].previousBucket

    creating[src] = { slot = slot, startedAt = os.time(), previousBucket = previousBucket }

    EnterBucket(src, creating[src])

    local today = os.date('*t')

    TriggerClientEvent('mono_creator:began', src, slot, {
        minAge = Config.Age.Min,
        maxAge = Config.Age.Max,
        year = today.year,
        month = today.month,
        day = today.day,
        nameMin = Config.Name.Min,
        nameMax = Config.Name.Max,
        maxEyeColor = Config.MaxEyeColor or 31
    })
end)

RegisterNetEvent('mono_creator:submit', function(data)
    local src = source

    local function reply(ok, errorCode, character)
        TriggerClientEvent('mono_creator:submitResult', src, ok, errorCode, character)
    end

    local session = creating[src]

    if not session or type(data) ~= 'table' then
        return reply(false, 'not_allowed')
    end

    if (os.time() - session.startedAt) > (Config.SessionTimeout or 1800) then
        EndSession(src)

        return reply(false, 'not_allowed')
    end

    if busy[src] then
        return
    end

    busy[src] = true

    local ok, character, errorCode = pcall(Submit, src, session, data)

    busy[src] = nil

    if not ok then
        Log(('Blad tworzenia postaci dla %s: %s'):format(src, tostring(character)))

        return reply(false, 'internal_error')
    end

    if not character then
        return reply(false, errorCode or 'unknown_error')
    end

    EndSession(src)

    Log(('Gracz %s [%s] utworzyl postac: %s %s [ID: %s, slot %s]'):format(
        GetPlayerName(src) or 'unknown',
        src,
        character.first_name,
        character.last_name,
        character.id,
        character.slot
    ))

    reply(true, nil, character)
end)

RegisterNetEvent('mono_creator:skinSubmit', function(rawAppearance)
    local src = source
    local session = skinEditing[src]

    local function reply(ok, code)
        TriggerClientEvent('mono_creator:skinSubmitResult', src, ok, code)
    end

    if not session or type(rawAppearance) ~= 'table' then
        skinEditing[src] = nil
        return reply(false, 'not_allowed')
    end

    if (os.time() - session.startedAt) > (Config.SessionTimeout or 1800) then
        skinEditing[src] = nil
        return reply(false, 'not_allowed')
    end

    if busy[src] then
        return reply(false, 'wait')
    end

    busy[src] = true

    local ok, success, errorCode = pcall(function()
        local character = exports.mono_core:GetActiveCharacter(src)

        if type(character) ~= 'table'
            or ToInteger(character.id) ~= session.characterId
            or character.gender ~= session.gender then
            return false, 'character_changed'
        end

        local normalized = exports.mono_appearance:NormalizeAppearance(rawAppearance, session.gender)

        if type(normalized) ~= 'table' or not normalized.ok then
            return false, normalized and normalized.error or 'invalid_appearance'
        end

        local appearanceToSave = normalized.appearance
        if session.mode == 'wardrobe' then
            local current = exports.mono_appearance:GetCharacterAppearance(session.characterId, session.gender)
            if type(current) ~= 'table' or not current.ok or type(current.appearance) ~= 'table' then
                return false, 'database_error'
            end

            appearanceToSave = current.appearance
            appearanceToSave.components = appearanceToSave.components or {}
            appearanceToSave.props = appearanceToSave.props or {}
            for _, id in ipairs({ 1, 3, 4, 5, 6, 7, 8, 9, 10, 11 }) do
                local drawableKey = 'c' .. id .. 'Drawable'
                local textureKey = 'c' .. id .. 'Texture'
                appearanceToSave.components[drawableKey] = normalized.appearance.components[drawableKey]
                appearanceToSave.components[textureKey] = normalized.appearance.components[textureKey]
            end
            for _, id in ipairs({ 0, 1, 2, 6, 7 }) do
                local drawableKey = 'p' .. id .. 'Drawable'
                local textureKey = 'p' .. id .. 'Texture'
                appearanceToSave.props[drawableKey] = normalized.appearance.props[drawableKey]
                appearanceToSave.props[textureKey] = normalized.appearance.props[textureKey]
            end
        end

        local saved = exports.mono_appearance:SaveAppearance(
            session.characterId,
            session.gender,
            appearanceToSave
        )

        if type(saved) ~= 'table' or not saved.ok then
            return false, saved and saved.error or 'database_error'
        end

        return true
    end)

    busy[src] = nil

    if not ok then
        Log(('Blad zapisu wygladu dla gracza %s: %s'):format(src, tostring(success)))
        return reply(false, 'internal_error')
    end

    if not success then
        return reply(false, errorCode or 'invalid_appearance')
    end

    skinEditing[src] = nil
    Log(('Admin %s zapisal wyglad postaci gracza %s [character ID: %s].'):format(
        tostring(session.requestedBy), src, tostring(session.characterId)
    ))
    reply(true)
end)

RegisterNetEvent('mono_creator:cancel', function()
    local src = source
    EndSession(src)
    skinEditing[src] = nil
end)

RegisterNetEvent('mono_creator:skinCancel', function()
    skinEditing[source] = nil
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end

    for src in pairs(creating) do
        EndSession(src)
    end

    skinEditing = {}
    busy = {}
end)

AddEventHandler('playerDropped', function()
    local src = source

    creating[src] = nil
    skinEditing[src] = nil
    busy[src] = nil
    lastBegin[src] = nil
end)
