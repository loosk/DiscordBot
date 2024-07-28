require('dotenv').config(); // Load environment variables from .env file
const { REST, Routes } = require('discord.js');
const { clientId, guildId } = require('../config.json');

const commands = [
    {
        name: 'shave',
        description: 'Shave 1 hair from yourself',
    },
    {
        name: 'grow',
        description: 'Grow 1 hair for yourself',
    },
    {
        name: 'donate',
        description: 'Donate hairs to another user',
        options: [
            {
                type: 6, // User type
                name: 'user',
                description: 'User to donate hairs to',
                required: true,
            },
            {
                type: 4, // Integer type
                name: 'amount',
                description: 'Amount of hairs to donate',
                required: true,
            },
        ],
    },
    {
        name: 'check',
        description: 'Check the hair count of a user',
        options: [
            {
                type: 6, // User type
                name: 'user',
                description: 'User to check hair count of',
                required: false,
            },
        ],
    },
    {
        name: 'get',
        description: 'Get a role based on hair count',
        options: [
            {
                type: 3, // String type
                name: 'role',
                description: 'Role to get (bald/furry)',
                required: true,
                choices: [
                    {
                        name: 'bald',
                        value: 'bald',
                    },
                    {
                        name: 'furry',
                        value: 'furry',
                    },
                ],
            },
        ],
    },
    {
        name: 'hairspin',
        description: 'Spin to get different types of hair',
    },
    {
        name: 'hairscheck',
        description: 'Check all hair types you have',
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
