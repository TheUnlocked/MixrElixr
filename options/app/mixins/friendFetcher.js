const ELIXR_CLIENT_ID = 'd2158e591bb347931751bef151ee3bf3e5c8cb9608924a7a';
const CURRENT_USER_URL = 'https://mixer.com/api/v1/users/current';
const HOST_CHANNEL_URL = 'https://mixer.com/api/v1/channels/{channelId}/hostee';

friendFetcher = { 
	methods: {
		getMixerId: function() {
			// This gets a channel id using a mixer username.
			return new Promise(function(resolve, reject) {

				var request = new XMLHttpRequest();

				request.open('GET', 'https://mixer.com/api/v1/users/current', true);
				request.setRequestHeader('Client-ID', ELIXR_CLIENT_ID);

				request.onload = function() {
					if (request.status >= 200 && request.status < 400) {
						// Success!
						var data = JSON.parse(request.responseText);
						resolve(data.id);
					} else {
						// We reached our target server, but it returned an error
						reject('Login at Mixer.com to see your online friends.');
					}
				};

				request.onerror = function() {
					// There was a connection error of some sort
					reject('Error getting userId');
				};

				request.send();
			});
        },
        getCurrentChannelId: async function() {
           try {
                let response = await fetch(CURRENT_USER_URL, {
                    credentials: 'include',
                    headers: {
                        'Client-ID': ELIXR_CLIENT_ID
                    }
                });
                if(response.ok) {
                    let user = await response.json();
                    return user && user.channel && user.channel.id;
                } else {
                    console.log('Failed to get current user.', response.statusText);
                    return null;
                }
            } catch(err) {
                console.log('Unable to get current user.', err);
                return null;
            }
        },
        sendHostChannelRequest: function(channelToHost) {
            let app = this;

            console.log("1!");
            return new Promise(async resolve => {

                console.log("here!");

                if(channelToHost == null) return resolve(false);

                console.log("2!");

                let channelId = await app.getCurrentChannelId();

                console.log("3!");

                if(!channelId) return resolve(false);
                console.log("4!");

                var xhr = new XMLHttpRequest();
                xhr.open("PUT", HOST_CHANNEL_URL.replace("{channelId}", channelId), true);
                xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
                xhr.onload = function () {
                    console.log("GOT RESPONSE")                 
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var responseData = JSON.parse(xhr.responseText);
                        console.log(responseData);
                        resolve(true);
                    } else {
                        console.error(xhr);
                        resolve(false);
                    }
                }

                xhr.onerror = function() {
                    console.log("ERROR WHILE HOSTING");
                    console.log(xhr);
                    resolve(false);
                }

                var data = {
                    id: channelToHost
                };
                var json = JSON.stringify(data);
                xhr.send(json);
            });
            /*try {

                if(channelToHost == null) return false;

                let channelId = await app.getCurrentChannelId();

                if(!channelId) return false;

                let formData = new FormData();
                formData.append('id', channelToHost);

                let response = await fetch(HOST_CHANNEL_URL.replace("{channelId}", channelId), {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Client-ID': ELIXR_CLIENT_ID
                    },
                    body: formData
                });
                if(!response.ok) {
                    console.log('Failed to host channel.', response.statusText);
                    return null;
                }
                return response.ok;
            } catch(err) {
                console.log('Failed to host channel.', err);
                return null;
            }*/
        },
		getMixerFollows: function(userId, page, followList, onlyOnline = true){
			var app = this;
			// This will get 100 follows on a specific page.
			return new Promise(function(resolve, reject) {
				// To test a lot of follows, uncomment the line below.
				//var userId = 313842;

				const pageSize = 100;
				
				console.log('Trying page '+page+' of follows for userId '+userId);


				var url = `https://mixer.com/api/v1/users/${userId}/follows?fields=id,online,name,token,viewersCurrent,partnered,costreamId,interactive,type,audience,user&where=online:eq:true&order=viewersCurrent:desc&limit=${pageSize}&page=${page}`;
				if(!onlyOnline) {
					// when we get all followers, we only need the id and their name, cuts down on how much data we bring over the wire
					url = `https://mixer.com/api/v1/users/${userId}/follows?fields=id,token&limit=${pageSize}&page=${page}`;
				}
				var request = new XMLHttpRequest();
				request.open('GET', url, true);

				request.onload = function() {
					if (request.status >= 200 && request.status < 400) {
					// Success!
						var data = JSON.parse(request.responseText);

						// Loop through data and throw in array.
						for (friend of data){
							followList.push(friend);
						}

						if(data.length >= pageSize) {
							app.getMixerFollows(userId, page+1, followList, onlyOnline).then((f) => {
								resolve(f);
							});
						} else {
							// If we hit 50 friends, cycle again because we've run out of friends on this api call.
							resolve(followList);
						}

					} else {
						// We reached our target server, but it returned an error
						reject('Error getting followed channels.');
					}
				};

				request.onerror = function() {
					// There was a connection error of some sort
					reject('Error while getting followed channels.');
				};

				request.send();
			});
		},
		outputMixerFollows: function(onlyOnline = true){
			var app = this;
			// This combines two functions so that we can get a full list of online followed channels with a username.
			return new Promise((resolve, reject) => {
				var page = 0;
				app.getMixerId()
					.then((userId) =>{
						app.getMixerFollows(userId, page, [], onlyOnline)
							.then((followList) =>{
								resolve(followList);
							})
							.catch((err) => {
								reject(err);
							});
					})
					.catch((err) => {
						reject(err);
					});
			});
		}
	}
};