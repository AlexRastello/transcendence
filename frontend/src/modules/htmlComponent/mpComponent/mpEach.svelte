<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { socketMpStore, socketUserStore } from "$lib/store/socket";
    import { myProfileDataStore, myRoomMpStore } from "$lib/store/user";
    import { io } from "socket.io-client";
    import { onMount } from "svelte";
    import MpModal from "./mpModal.svelte";

	let myProfile : any;
	let myRoomMp : any;
	let socketMp : any;
	let socketUser : any;
	let divMp : any;

	myRoomMpStore.subscribe(val => myRoomMp = val);
	myProfileDataStore.subscribe(val => myProfile = val);
	socketMpStore.subscribe(val => socketMp = val);
	socketUserStore.subscribe(val => socketUser = val);
	myRoomMpStore.subscribe(val => myRoomMp = val);

	onMount(async () => {
		let socketMp = io(API_URL, {
			query : {
				token : getJwt()
			},
			path : "/private-message"
		});

		socketMp.on("update-user", (data : any) => {
			myProfileDataStore.set(data);
		})
		socketMp.on("all-update-room", (data : any) => {
			myRoomMpStore.set(data);
		})
		socketMp.on("update-room", (data : any) => {
			if (myRoomMp && myRoomMp.length != 0) {
				let arrId : number [] = [];
				for (let i = 0; i < myRoomMp.length; i++) {
					if (myRoomMp[i].id == data.id) {
						myRoomMp[i] = data;
						myRoomMpStore.set(myRoomMp)
						arrId.push(data.id);
					}
				}
				if (arrId && !arrId.includes(data.id)) {
					myRoomMp.push(data)
					myRoomMpStore.set(myRoomMp);
				}
			} else {
				myRoomMp.push(data)
				myRoomMpStore.set(myRoomMp);
			}
		})
		socketMpStore.set(socketMp);

	})

</script>
<div class="div-mp" bind:this={divMp}>
	{#each myRoomMp as room}
		<MpModal room={room} myProfile={myProfile} socketMp={socketMp} socketUser={socketUser}/>
	{/each}
</div>

