module.exports = async function(interaction) {
    if (!interaction.isButton()) return;

    switch (interaction.customId) {
        case 'purchasedShampoo1':
            interaction.reply({ content: 'You purchased shampoo 1 🧴', ephemeral: true});
            break;
        case 'purchasedShampoo2':
            interaction.reply({ content: 'You purchased shampoo 1 🧴', ephemeral: true});
            break;
        default:
            break;
    }
    
};