const socket = io();
const $messageForm = document.querySelector('#message-form');
const $messageFormButton = $messageForm.querySelector('button');
const $messageFormInput = $messageForm.querySelector('input');
const $locationSendButton = document.querySelector('#send-location-button');
const $messages = document.querySelector('#messages');
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const $sidebar = document.querySelector('#sidebar');


const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message);

    const html = Mustache.render($messageTemplate,{
        username:message.username,
        message:message.message,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll();
    
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled');
    
    const message = $messageFormInput.value;
   
    socket.emit('sendMessage',message,(error)=>{


    $messageFormButton.removeAttribute('disabled');
    
    $messageFormInput.value='';
    $messageFormInput.focus();
        if(error){
            return console.log(error)
        }

        console.log('message delivered')

    });

   
})

socket.on('roomData',({users,room}) =>{
   
    const html = Mustache.render($sidebarTemplate,{
        room,
        users,
    
    })

    document.querySelector('#sidebar').innerHTML=html;

})

socket.on('sendLocation',(url)=>{
    console.log(url);

    const html = Mustache.render($locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll();

})

socket.emit('join',{username,room},(error)=>{

    if(error){
        alert(error)
        location.href='/'
    }
});


$locationSendButton.addEventListener('click',()=>{

    $locationSendButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('Geolocation not suported by your brwrs');
    }

    navigator.geolocation.getCurrentPosition((position) =>{

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log("location sent");
            $locationSendButton.removeAttribute('disabled');
        });
    });


})

