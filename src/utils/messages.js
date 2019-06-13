
const generateMessage = (username, text)=>{
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessages = (username, url)=>{
    console.log('generate')
    return {
        url,
        username,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessages
}