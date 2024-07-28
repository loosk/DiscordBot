require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { clientId, guildId } = require('../config.json');
const { loadUserHairs, saveUserHairs } = require('./storage');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const BALD_ROLE_ID = '1263836098828697661';
const FURRY_ROLE_ID = '1263836171373383680';

let userHairs = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    userHairs = loadUserHairs();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, user } = interaction;

    if (!userHairs.has(user.id)) {
        userHairs.set(user.id, 0);
        saveUserHairs(userHairs);
    }

    if (commandName === 'shave') {
        const currentHairs = userHairs.get(user.id);
        const newHairs = Math.max(currentHairs - 1, 0);
        userHairs.set(user.id, newHairs);
        saveUserHairs(userHairs);

        await interaction.reply(`You shaved 1 hair. You have ${newHairs} hairs remaining.`);

        await updateRoles(interaction.guild, user.id, newHairs);
    }

    if (commandName === 'grow') {
        const currentHairs = userHairs.get(user.id);
        const newHairs = currentHairs + 1;
        userHairs.set(user.id, newHairs);
        saveUserHairs(userHairs);

        await interaction.reply(`You grew 1 hair. You have ${newHairs} hairs remaining.`);

        await updateRoles(interaction.guild, user.id, newHairs);
    }

    if (commandName === 'donate') {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (targetUser.id === user.id) {
            return interaction.reply("You can't donate hair to yourself.");
        }

        const donorHairs = userHairs.get(user.id);
        if (amount <= 0) {
            return interaction.reply("You must donate a positive number of hairs.");
        }
        if (amount > donorHairs) {
            return interaction.reply("You don't have enough hairs to donate.");
        }

        const newDonorHairs = donorHairs - amount;
        userHairs.set(user.id, newDonorHairs);

        const recipientHairs = userHairs.get(targetUser.id) || 0;
        const newRecipientHairs = recipientHairs + amount;
        userHairs.set(targetUser.id, newRecipientHairs);

        saveUserHairs(userHairs);

        await interaction.reply(`You donated ${amount} hairs to ${targetUser.username}.`);

        await updateRoles(interaction.guild, user.id, newDonorHairs);
        await updateRoles(interaction.guild, targetUser.id, newRecipientHairs);
    }

    if (commandName === 'check') {
        const targetUser = interaction.options.getUser('user') || user;
        const targetHairs = userHairs.get(targetUser.id) || 0;

        await interaction.reply(`${targetUser.username} has ${targetHairs} hairs.`);
    }

    if (commandName === 'get') {
        const roleName = interaction.options.getString('role');

        let roleId;
        if (roleName === 'bald') {
            roleId = BALD_ROLE_ID;
            if (userHairs.get(user.id) === 0) {
                await assignRole(interaction.guild, user.id, roleId);
                await interaction.reply("You have been assigned the Bald role.");
            } else {
                await interaction.reply("You do not meet the requirement for the Bald role.");
            }
        } else if (roleName === 'furry') {
            roleId = FURRY_ROLE_ID;
            if (userHairs.get(user.id) >= 10000) {
                await assignRole(interaction.guild, user.id, roleId);
                await interaction.reply("You have been assigned the Furry role.");
            } else {
                await interaction.reply("You do not meet the requirement for the Furry role.");
            }
        } else {
            await interaction.reply("Invalid role specified. Use 'bald' or 'furry'.");
        }
    }
});

const assignRole = async (guild, userId, roleId) => {
    try {
        const member = await guild.members.fetch(userId);
        const role = guild.roles.cache.get(roleId);

        if (role) {
            if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId);
                console.log(`Added ${role.name} role to ${member.user.tag}`);
            }
        } else {
            console.error(`Role with ID ${roleId} not found`);
        }
    } catch (error) {
        console.error(`Error assigning role ${roleId} to user ${userId}:`, error);
    }
};

const updateRoles = async (guild, userId, hairs) => {
    try {
        const member = await guild.members.fetch(userId);

        const hasBaldRole = member.roles.cache.has(BALD_ROLE_ID);
        if (hairs === 0) {
            if (!hasBaldRole) {
                await member.roles.add(BALD_ROLE_ID);
                console.log(`Added Bald role to ${member.user.tag}`);
            }
        } else {
            if (hasBaldRole) {
                await member.roles.remove(BALD_ROLE_ID);
                console.log(`Removed Bald role from ${member.user.tag}`);
            }
        }

        const hasFurryRole = member.roles.cache.has(FURRY_ROLE_ID);
        if (hairs >= 10000) {
            if (!hasFurryRole) {
                await member.roles.add(FURRY_ROLE_ID);
                console.log(`Added Furry role to ${member.user.tag}`);
            }
        } else {
            if (hasFurryRole) {
                await member.roles.remove(FURRY_ROLE_ID);
                console.log(`Removed Furry role from ${member.user.tag}`);
            }
        }
    } catch (error) {
        console.error(`Error updating roles for user ${userId}:`, error);
    }
};

client.login(process.env.DISCORD_TOKEN);
