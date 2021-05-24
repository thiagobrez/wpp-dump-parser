const commander = require('commander')
const fs = require('fs');
const {Parser} = require('json2csv')

const cli = commander
    .version('0.1.0')
    .usage('[options] <file>')
    .arguments('<file>')
    .action(function (file) {
        filePath = file;
    })
    .parse(process.argv);

if (typeof filePath === 'undefined') {
    console.error('no file given!');
    process.exit(1);
}

const text = fs.readFileSync(filePath).toString();
const dateRegex = /[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]/g;

const dateMatches = text.matchAll(dateRegex);
const dates = [];

for (const match of dateMatches) {
    const date = match[0];
    dates.push(date);
}

const messages = text.split(dateRegex);
messages.shift();

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

const formattedMessages = messages.map((string, index) => {
    const firstSpaceIndex = getPosition(string, ' ', 1);
    const secondSpaceIndex = getPosition(string, ' ', 2);
    const firstHiphenIndex = getPosition(string, '-', 1);
    const secondColonIndex = getPosition(string, ':', 2)

    const date = dates[index];
    const time = string.substring(firstSpaceIndex + 1, secondSpaceIndex)
    const user = string.substring(firstHiphenIndex + 2, secondColonIndex)
    const message = string.substring(secondColonIndex + 2, string.length)

    return {
        date,
        time,
        user,
        message,
    }
})

const filteredMessages = formattedMessages.filter(message => !message.user.includes('saiu'))

const fields = [
    {label: 'Data', value: 'date'},
    {label: 'Hora', value: 'time'},
    {label: 'Usuario', value: 'user'},
    {label: 'Mensagem', value: 'message'},
]

const json2csv = new Parser({fields: fields})

try {
    const csv = json2csv.parse(filteredMessages)

    fs.writeFile('output.csv', csv, function (err) {
        if (err) return console.log('Error writing file: ', err);
    })
} catch (error) {
    console.log('Error parsing json: ', error)
}
