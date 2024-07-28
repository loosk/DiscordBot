const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../storage.json');

const loadUserHairs = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);

        const userHairs = new Map(Object.entries(parsedData));

        return userHairs;
    } catch (err) {
        console.error('Error reading storage file:', err);
        return new Map();
    }
};

const saveUserHairs = (userHairs) => {
    try {
        const data = Object.fromEntries(userHairs.entries());
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to storage file:', err);
    }
};

module.exports = { loadUserHairs, saveUserHairs };
