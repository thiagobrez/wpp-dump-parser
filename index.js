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

const messages = fs.readFileSync(filePath).toString().split("\n");

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

const formattedMessages = messages.map(string => {
    const firstSpaceIndex = getPosition(string, ' ', 1);
    const secondSpaceIndex = getPosition(string, ' ', 2);
    const plusSignIndex = getPosition(string, '+', 1);
    const secondColonIndex = getPosition(string, ':', 2)

    const date = string.substring(0, firstSpaceIndex) // from start to first space
    const time = string.substring(firstSpaceIndex + 1, secondSpaceIndex) // from first space to second space
    const phone = string.substring(plusSignIndex, secondColonIndex) // from `+` to second `:`
    const message = string.substring(secondColonIndex + 2, string.length) // from second `:` plus 2 chars, until the end

    return {
        date,
        time,
        phone,
        message,
    }
})

const fields = [
    {label: 'Data', value: 'date'},
    {label: 'Hora', value: 'time'},
    {label: 'Telefone', value: 'phone'},
    {label: 'Mensagem', value: 'message'},
]

const json2csv = new Parser({fields: fields})

try {
    const csv = json2csv.parse(formattedMessages)

    fs.writeFile('output.csv', csv, function (err) {
        if (err) return console.log('Error writing file: ', err);
    })
} catch (error) {
    console.log('Error parsing json: ', error)
}
