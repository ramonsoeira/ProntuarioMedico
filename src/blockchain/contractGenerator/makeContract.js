class MakeContract {
    makeFile (params={}) {
        const { name, data, groupings } = params
        let version = require('solc').version().split('+')[0]

        let contract = ''

        //declare version
        contract += 'pragma solidity ^' + version + ';\n\n'

        //declare bd name
        contract += 'contract Prontuario' + name + 'BD {\n'

        let attributes = []

        //COLOCA TODOS OS DADOS EM --->>> ARRAY <<<---
        for (let i=1; i<=Object.keys(data).length/2; i++) {
            attributes.push(data["a"+i])
            let s = "type" + String(i)
            attributes.push(data[s])
        }

        let structs = []

        //COLETAR NOME DAS STRUCTS EM ARRAY
        for (let i=1; i<= Object.keys(groupings).length; i++) {
            let space = groupings[i].split(' ')[0].split('-')
            let nameStruct = groupings[i].split(' ')[1]
            structs.push([nameStruct, space])
        }
        // console.log(structs.length)

        for (let i=0; i<structs.length; i++) {
            contract += '\n\tstruct ' + structs[i][0] + ' {\n'
            for (let j=Number.parseInt(structs[i][1][0])*2; j<Number.parseInt(structs[i][1][1])*2; j+=2) {
                contract += '\t\t' + attributes[j+1] + ' ' + attributes[j] + ';\n'
            }
            contract += '\t}\n\n'
        }

        for (let i=0; i<structs.length; i++) {  
            contract += '\tmapping (address => ' + structs[i][0] + ') register_' + structs[i][0] + ';\n'
        }

        contract += '\n}\n\ncontract Prontuario' + name + ' is ' + 'Prontuario' + name + 'BD' + ' {\n'

        //funcoes
        for (let i=0; i<structs.length; i++) {
            contract += '\tfunction set' + structs[i][0] + '('

            //parametros funcao set
            for (let j = Number.parseInt(structs[i][1][0])*2; j<Number.parseInt(structs[i][1][1])*2; j+=2) {
                contract += attributes[j+1] + ' ' + attributes[j]
                if (j!==Number.parseInt(structs[i][1][1])*2-1 && j!==Number.parseInt(structs[i][1][1])*2-2) {
                    contract += ', '
                }
            } contract += ') public {\n'

            contract += '\t\tregister_' + structs[i][0] + '[msg.sender] = ' + structs[i][0] + '({\n'
            
            for (let j = Number.parseInt(structs[i][1][0])*2; j<Number.parseInt(structs[i][1][1])*2; j+=2) {
                contract += '\t\t\t' + attributes[j] + ': ' + attributes[j]
                if (j!==Number.parseInt(structs[i][1][1])*2-1 && j!==Number.parseInt(structs[i][1][1])*2-2) {
                    contract += ',\n'
                } else {
                    contract += '\n'
                }
            }
            contract += '\t\t});\n\t}\n\n'

            for (let j = Number.parseInt(structs[i][1][0])*2; j<Number.parseInt(structs[i][1][1])*2; j+=2) {
                contract += '\tfunction get' + attributes[j] + '() public view returns(' + attributes[j+1] + ') {\n'
                contract += '\t\treturn register_' + structs[i][0] + '[msg.sender].' + attributes[j] + ';\n'
                contract += '\t}\n\n'
            }
        }

        contract += '\n}\n'
        return contract
    }

}

module.exports = MakeContract