<script lang="ts">
    import { Avatar, Dropdown } from "flowbite-svelte";
    import { myNotifLength, myProfileDataStore } from '$lib/store/user';
    import { socketFriendStore, socketMpStore, socketRoomStore, socketUserStore } from "$lib/store/socket";
    import { GetAllUsers, GetOneUser } from "$lib/userUtils";
    import SvgAdd from "./htmlComponent/svgComponent/svgAdd.svelte";
    import SvgDelete from "./htmlComponent/svgComponent/svgDelete.svelte";
    import { onMount } from "svelte";
    import { io } from "socket.io-client";
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { goto } from "$app/navigation";

	let socketFriend : any;
	let socketUser : any;
	let socketMp : any;
	let socketRoom : any;
	let myProfile : any;
	let countNotif : any;
	let openDropdown : boolean = false;

	myProfileDataStore.subscribe(val => myProfile = val);
	myNotifLength.subscribe(val => countNotif = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);
	socketMpStore.subscribe(val => socketMp = val);
	socketRoomStore.subscribe(val => socketRoom = val);

	async function blockUser(notif : any) {
		await GetAllUsers()
		.then((res) => {
			const users = res.data;
			if (users) {
				users.forEach((elem : any) => {
					if (elem.id == notif.id_user_send) {
						socketUser.emit("block_user", { id_user_receive : elem.id, id_user_send : myProfile.id })
					}
				});
			}
		})
	}

	async function handleViewMp(notif : any) {
		await GetOneUser(notif.id_user_send)
		.then(async (res) => {
			socketMp.emit("create-room", {user_send : myProfile, user_receive : res.data})
			socketUser.emit("delete-notification", {id_notif : notif.id, user : myProfile});
		})
	}

	function handleDeleteNotif(notif : any) {
		socketUser.emit("delete-notification", {id_notif : notif.id, user : myProfile});
	}

	function handleViewRoomPrivate(notif : any) {
		socketRoom.emit("joinInvite", {roomName : notif.name_room_private})
		socketUser.emit("delete-notification", {id_notif : notif.id, user : myProfile});
	}

	async function handleAcceptGame(notif : any) {
		goto("/users");
		await new Promise(r => setTimeout(r, 100));
		goto(`/game?id_send=${notif.id_user_send}&id_receive=${notif.id_user_receive}`);
		socketUser.emit("delete-notification", {id_notif : notif.id, user : myProfile});
	}

</script>

<div class="div-notif">
	<span class="relative flex h-3 w-3 translate-x-4">
		{#if countNotif > 0}
			<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-third opacity-75 right-0"></span>
			<span class="relative inline-flex rounded-full h-3 w-3 bg-third justify-self-end"></span>
		{/if}
	</span>
	<svg on:keydown={() => openDropdown = true} class="fill-secondary h-6 hover:fill-third transition-colors duration-300 cursor-pointer" viewBox="0 0 46 48" xmlns="http://www.w3.org/2000/svg">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M23.0002 0C12.5068 0 4.00017 8.50659 4.00017 19V32.5335C4.00017 32.8383 3.9145 33.1371 3.75292 33.3956L0.912672 37.94C0.0801118 39.2721 1.0378 41 2.60867 41H43.3917C44.9625 41 45.9202 39.2721 45.0877 37.94L42.2474 33.3956C42.0858 33.1371 42.0002 32.8383 42.0002 32.5335V19C42.0002 8.50659 33.4936 0 23.0002 0ZM23.0002 48C20.2388 48 18.0002 45.7614 18.0002 43H28.0002C28.0002 45.7614 25.7616 48 23.0002 48Z"></path>
	</svg>
</div>
{#if myProfile.notification && myProfile.notification.length > 0}
	<Dropdown bind:open={openDropdown} frameClass="shadow-md !bg-primary !w-1/2 dropdown-notification">
			{#each myProfile.notification as notif}
			<div class="notification w-full p-3">
				{#if notif.type == 0}
					<div class="flex gap-5">
						<div>
							<button class="button-card-user">...</button>
							<Dropdown class="w-36">
								<button on:click={() => blockUser(notif)} class="rounded p-1 !bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">
									Block user
								</button>
							</Dropdown>
							<Avatar src={notif.img_link} class="object-cover bg-transparent" rounded/>
						</div>
						<div class="text-notif flex flex-col items-center justify-end">
							<p>Friend request from</p>
							<a href="/user?id={notif.id_user_send}" class="capitalize hover:text-third transition-colors duration-300">{notif.login_send}</a>
						</div>
					</div>
					<div class="flex justify-center gap-5 mt-2">
						<button on:click={() => socketFriend.emit("accept_friend", { user : myProfile, notif})}>
							<SvgAdd />
						</button>
						<button on:click={() => socketFriend.emit("refuse_friend", {user : myProfile, notif})}>
							<SvgDelete />
						</button>
					</div>
				<!-- {:else if notif.type == 1}
					<div class="flex gap-5">
						<div>
							<button class="button-card-user">...</button>
							<Dropdown class="w-36">
								<button on:click={() => blockUser(notif)} class="rounded p-1 !bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">
									Block user
								</button>
							</Dropdown>
							<Avatar src={notif.img_link} class="object-cover bg-transparent" rounded/>
						</div>
						<div class="text-notif flex flex-col items-center justify-end">
							<p>New message from</p>
							<a href="/user?id={notif.id_user_send}" class="capitalize hover:text-third transition-colors duration-300">{notif.login_send}</a>
						</div>
					</div>
					<div class="flex justify-center gap-5 mt-2">
						<button on:click={() => handleDeleteNotif(notif)}>
							Delete
						</button>
						<button on:click={() => handleViewMp(notif)}>
							View
						</button>
					</div> -->
				{:else if notif.type == 2}
					<div class="flex gap-5">
						<div>
							<button class="button-card-user">...</button>
							<Dropdown class="w-36">
								<button on:click={() => blockUser(notif)} class="rounded p-1 !bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">
									Block user
								</button>
							</Dropdown>
							<Avatar src={notif.img_link} class="object-cover bg-transparent" rounded/>
						</div>
						<div class="text-notif flex flex-col items-center justify-end">
							<p>New invite to join channel {notif.name_room_private} from</p>
							<a href="/user?id={notif.id_user_send}" class="capitalize hover:text-third transition-colors duration-300">{notif.login_send}</a>
						</div>
					</div>
					<div class="flex justify-center gap-5 mt-2">
						<button on:click={() => handleDeleteNotif(notif)}>
							Refuse
						</button>
						<button on:click={() => handleViewRoomPrivate(notif)}>
							Accept
						</button>
					</div>
				{:else if notif.type == 3}
					<div class="flex gap-5">
						<div>
							<button class="button-card-user">...</button>
							<Dropdown class="w-36">
								<button on:click={() => blockUser(notif)} class="rounded p-1 !bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">
									Block user
								</button>
							</Dropdown>
							<Avatar src={notif.img_link} class="object-cover bg-transparent" rounded/>
						</div>
						<div class="text-notif flex flex-col items-center justify-end">
							<p>New invite to play with</p>
							<a href="/user?id={notif.id_user_send}" class="capitalize hover:text-third transition-colors duration-300">{notif.login_send}</a>
						</div>
					</div>
					<div class="flex justify-center gap-5 mt-2">
						<button on:click={() => handleDeleteNotif(notif)}>
							Refuse
						</button>
						<button on:click={() => handleAcceptGame(notif)}>
							Accept
						</button>
					</div>
				{/if}
				</div>
			{/each}
	</Dropdown>
{/if}
