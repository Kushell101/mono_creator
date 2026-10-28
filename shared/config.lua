Config = {}

Config.Age = { Min = 18, Max = 85 }

Config.Name = { Min = 2, Max = 20 }

Config.Scene = { label = 'Molo Del Perro', x = -1849.5, y = -1226.0, z = 13.0, heading = 315.0, hour = 18, weather = 'EXTRASUNNY' }

Config.Poses = {
    { id = 'relaxed', label = 'Swobodnie',    scenario = 'WORLD_HUMAN_HANG_OUT_STREET' },
    { id = 'lean',    label = 'Oparty',       scenario = 'WORLD_HUMAN_LEANING' },
    { id = 'boss',    label = 'Pewny siebie', dict = 'anim@heists@heist_corona@single_team', clip = 'single_team_loop_boss' },
    { id = 'neutral', label = 'Neutralnie' }
}

Config.DefaultPose = 'relaxed'

Config.CameraShift = 0.7

Config.Camera = {
    body      = { dist = 2.6,  camZ = 1.15, lookZ = 0.90, fov = 42.0 },
    face      = { dist = 0.95, camZ = 1.68, lookZ = 1.66, fov = 32.0 },
    faceClose = { dist = 0.65, camZ = 1.68, lookZ = 1.67, fov = 30.0 },
    feet      = { dist = 1.3,  camZ = 0.35, lookZ = 0.25, fov = 45.0 },
    heritage  = { dist = 4.5,  camZ = 1.55, lookZ = 1.05, fov = 58.0 }
}

Config.DepthOfField = { Enabled = true, Strength = 0.9, Before = 0.9, After = 1.1 }

Config.Lights = {
    { Forward = 1.8,  Side = 1.3,  Height = 2.2, Color = { 255, 214, 170 }, Range = 6.0, Intensity = 5.0 },
    { Forward = -1.2, Side = -1.6, Height = 2.1, Color = { 150, 180, 255 }, Range = 5.0, Intensity = 4.0 }
}

Config.Parents = { Enabled = true, Spread = 0.95, Back = 0.3 }

Config.RoutingBucket = { Enabled = true, Base = 4000 }

Config.SessionTimeout = 1800

Config.MaxEyeColor = 13

Config.Debug = false