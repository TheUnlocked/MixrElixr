import { Socket } from '@mixer/chat-client-websocket';
import * as api from '../api';
import { messagedDeleted } from '../pages/chat-feed';
import { log } from '../utils';

let socket;
let isConnectingToChat = false;
let userIsMod = false;

const MODE_ROLES = ['Mod', 'ChannelEditor', 'Owner'];

export async function connectToChat(channelId, userId) {
    if (isConnectingToChat) return;
    isConnectingToChat = true;
    disconnectChat();

    let chatInfo = await api.getChannelChatInfo(channelId);

    // check if user has mod status
    userIsMod = chatInfo.roles.find(r => MODE_ROLES.includes(r));

    createChatSocket(userId, channelId, chatInfo.endpoints, chatInfo.authkey);
}

export function disconnectChat() {
    if (isConnectingToChat) return;
    if (socket != null) {
        log('Disconnecting from MixerSocket!');
        socket.close();
        socket = null;
    }
}

/**
 * Creates a Mixer chat socket and sets up listeners to various chat events.
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id to join
 * @param {string[]} endpoints An array of endpoints to connect to
 * @param {string} authkey An authentication key to connect with
 * @returns {Promise.<>}
 */
function createChatSocket(userId, channelId, endpoints, authkey) {
    const ws = WebSocket;
    socket = new Socket(ws, endpoints).boot();

    // You don't need to wait for the socket to connect before calling
    // methods. We spool them and run them when connected automatically.
    let userToConnectAs = userId;
    if (authkey == null) {
        userToConnectAs = null;
    }

    socket
        .auth(channelId, userToConnectAs, authkey)
        .then(() => {
            log('Connected to chat!');
            isConnectingToChat = false;
        })
        .catch(error => {
            log('Oh no! An error occurred when connecting to chat.');
            isConnectingToChat = false;
            console.error(error);
        });

    // Listen for chat messages
    socket.on('DeleteMessage', data => {
        if (userIsMod && data && data.moderator) {
            messagedDeleted(data.id, data.moderator['user_name']);
        }
    });

    // Listen for socket errors. You will need to handle these here.
    socket.on('error', error => {
        log('Chat socket error');
        console.error(error);
    });
}
