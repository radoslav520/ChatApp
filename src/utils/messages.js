
const generateMessage = (username,text) =>{
    return {
        username,
        createdAt:new Date().getTime(),
        message:text
    }
}

const generateLocationMessage = (username,url)=>{
    return{
        username,
        createdAt:new Date().getTime(),
        url:url
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}