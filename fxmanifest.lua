fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Kushell'
description 'Character creator for RP'
version '0.1.0'

dependencies {
    'mono_core',
    'mono_appearance',
    'oxmysql'
}

shared_script 'shared/config.lua'

ui_page 'nui/index.html'

files {
    'nui/index.html',
    'nui/style.css',
    'nui/app.js'
}

client_script 'client/main.lua'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}
