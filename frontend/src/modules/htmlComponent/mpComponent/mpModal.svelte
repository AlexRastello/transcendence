<script lang="ts">
    import { afterUpdate } from "svelte";
    import MpBody from "./mpBody.svelte";
    import SvgCancel from "../svgComponent/svgCancel.svelte";
    import { Dropdown, DropdownItem } from "flowbite-svelte";
    import { GetOneUser } from "$lib/userUtils";
    import { goto } from "$app/navigation";
    import { userProfileDataStore, usersDataStore } from "$lib/store/user";

	export let room : any;
	export let myProfile : any;
	export let socketMp : any;
	export let socketUser : any;

	let dropdownOpen : boolean = false;
	let otherProfile : any;
	let inputMp : any;
	let active : string = "";
	let allUsers : any;

	usersDataStore.subscribe(val => allUsers = val);

	afterUpdate(() => {
		if (room && room.user) {
			for (let i = 0; i < allUsers.length; i++) {
				for (let j = 0; j < room.user.length; j++) {
					if (room.user[j].id != myProfile.id && room.user[j].id == allUsers[i].id) {
						otherProfile = allUsers[i];
						break;
					}
				}
			}
		}
	})

	function closeMp(room : any) {
		socketMp.emit("close-room", {id_user : myProfile.id, id_room : room.id})
	}

	function handleSubmit(e : any) {
		if (e.key === "Enter")
			submitMp();
	}

	function changeInput() {
		if (inputMp == "") {
			socketMp.emit("unwrite", {user_receive : otherProfile, room, login : myProfile.login});
		}
		else {
			socketMp.emit("write", {user_receive : otherProfile, room, login : myProfile.login});
		}
	}

	function submitMp() {
		if (inputMp != "") {
			for (let i = 0; i < room.user.length; i++) {
				if (room.user[i].id != myProfile.id) {
					socketMp.emit("send-mp", {id_user_send : myProfile.id, id_user_receive : room.user[i].id , id_room : room.id, content : inputMp})
					socketMp.emit("unwrite", {user_receive : otherProfile, room, login : myProfile.login});
					socketUser.emit("notification_mp", {user_send : myProfile, user_receive : room.user[i] , id_room : room.id, content : inputMp})
				}
			}
			inputMp = "";
		}
	}

	function updateActive() {
		if (active == "")
			active = "active";
		else
			active = ""
	}

	async function handleGotoUser(id : string) {
        await GetOneUser(id)
        .then((res) => {
            userProfileDataStore.set(res.data);
        })
        goto(`/user?id=${id}`);
    }
</script>
{#if otherProfile && myProfile && room.open_id && room.open_id.includes(myProfile.id) && otherProfile.block_id && !otherProfile.block_id.includes(myProfile.id) && myProfile.block_id && !myProfile.block_id.includes(otherProfile.id)}
	<div class="mp-modal">
		<button class="header {active}">
			<button class="button-card-user">...</button>
			<Dropdown open={dropdownOpen} class="bg-primary">
				<DropdownItem  defaultClass="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm"  on:click={() => {socketUser.emit("notification_game", {user_send : myProfile, user_receive : otherProfile}); goto(`/game?id_send=${myProfile.id}&id_receive=${otherProfile.id}`)}}>
					Invite game
				</DropdownItem>
				<DropdownItem defaultClass="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm" on:click={() => {handleGotoUser(otherProfile.id); dropdownOpen = false;}}>
					Profile
				</DropdownItem>
			</Dropdown>
			<button class="login" on:click={updateActive}>{otherProfile.login}</button>
			<button on:click={() => closeMp(room)}>
				<SvgCancel />
			</button>
		</button>
		<MpBody room={room} active={active} otherProfile={otherProfile}/>
		<div class="send {active}">
			<input placeholder="Send a message" class="send-msg focus:outline-none focus:ring-0" type="text" bind:value={inputMp} on:keypress={handleSubmit} on:input={changeInput}/>
		</div>
	</div>
{/if}
