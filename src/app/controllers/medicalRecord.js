const express = require('express')
const middleware = require('../middlewares/auth')
const compClass = require('../../blockchain/contractGenerator/makeContract')
const fs = require('fs')
const { UserRoot } = require('../models/user')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const temporaryFileManager = require('../../blockchain/contractGenerator/temp/temporaryFileManager')

//######################SETAR A CONTA ETHEREUM DE TESTE AQUI######################//
//em produção será trocado por user.ethAddress
const ethAccountAddress = '0x9B985e650297407E0E7Ab9A2849ac0046cc84Fa0' // <- por enquanto colocar o addrs de uma conta em private net aqui!
const ethAccountPassword = '0x09e146c2444d8e198d0d65b27222de2ec915753459b5f7d4cf704ad38186ac32'// <- inserir a senha da mesma, em produção será gerado um hash com o user.password

const router = express.Router()

router.use(middleware)

module.exports = (app, web3) => {
    app.use('/medicalRecord', router)

    router.post('/create', async (req, res) => {
        const { id, name, data, groupings } = req.body
        const contrBody = {
            name: name,
            data: data,
            groupings: groupings
        }

        try {
            const user = await UserRoot.findById(id).select('+ethAddress medicalRegisterAddress password')
            if(!user) res.status(400).send({ error: 'User not found' })

            const compiler = new compClass()
            const compiledCode = await compiler.makeFile(contrBody)

            const blockchainDir = __dirname + '/../../blockchain/contractGenerator/temp/'
            const file = blockchainDir+'Prontuario'+name+'.sol'

            fs.writeFileSync(file, compiledCode)
            
            await exec('solcjs --bin --abi '+file+' --output-dir '+blockchainDir)

            //obtem a ABI por meio da função de gerenciamento dos arquivos temporários (ver arquivo)
            let abibd = temporaryFileManager(name+'BD', 'abi')

            let contractbd = new web3.eth.Contract(JSON.parse(abibd))
            
            //para publicar um contrato, a conta ethereum responsável precisa estar desbloqueada
            web3.eth.personal.unlockAccount(ethAccountAddress, ethAccountPassword, 600)
            //após ser desbloqueada seguimos fazendo deploy do primeiro contrato,
            //cuja função é apenas de armazenamento.
            .then(() => {
                contractbd.deploy({
                    data: '0x'+temporaryFileManager(name+'BD', 'bin')
                }).send({
                        from: ethAccountAddress,
                        gas: 1500000,
                        gasPrice: web3.utils.toWei('0.00003', 'ether')
                }).then(() => {
                    let abifuncs = temporaryFileManager(name, 'abi')

                    let contractfuncs = new web3.eth.Contract(JSON.parse(abifuncs))

                    contractfuncs.deploy({
                        data: '0x'+temporaryFileManager(name, 'bin')
                    }).send({
                        from: ethAccountAddress,
                        gas: 1500000,
                        gasPrice: web3.utils.toWei('0.00003', 'ether')
                    })
                    //como o contrato abaixo sempre vai herdar o acima precisamos espera-lo fazer deploy,
                    //para só então fazer deploy neste que segue...
                    .then( async newContractFuncs => {

                        //salva o contractAddress na base do usuario
                        user.medicalRegisterAddress.push(newContractFuncs.options.address)
                        await user.save()

                        //apaga os arquivos temporarios criados
                        require('../../blockchain/contractGenerator/temp/garbageCollector')()
                        return res.send({ contractAddress: newContractFuncs.options.address })
                    })
                })
            })
        } catch(err) {
            console.log(err)
            return res.status(400).send({ error: err })
        }
    })
}