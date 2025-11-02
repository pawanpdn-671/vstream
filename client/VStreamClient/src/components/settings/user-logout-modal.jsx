import React from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../shared/dialog";
import { LogOut } from "lucide-react";
import { Button } from "../shared/button";

const UserLogoutModal = ({ logoutUser }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className={"justify-start"}>
					<LogOut size={20} /> Logout
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Confirmation</DialogTitle>
				</DialogHeader>
				<div className="pb-5">
					<p>Are you sure you want to logout?</p>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button variant="destructive" onClick={logoutUser}>
						Logout
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UserLogoutModal;
