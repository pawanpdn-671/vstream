import { getCroppedImg } from "@/lib/cropImage";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Button } from "../shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../shared/dialog";
import { Input } from "../shared/input";
import { Slider } from "../shared/slider";
import { useUploadAvatar } from "@/hooks/user/useUploadAvatar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const UploadAvatarModal = ({ openModal, onClose }) => {
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [croppedImage, setCroppedImage] = useState(null);
	const [fileBlob, setFileBlob] = useState(null);

	const { uploadAvatar, isError, isPending } = useUploadAvatar();
	const queryClient = useQueryClient();

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const onDrop = useCallback((acceptedFiles) => {
		const file = acceptedFiles[0];
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			setImageSrc(reader.result);
		});
		reader.readAsDataURL(file);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/png": [],
			"image/jpeg": [],
			"image/jpg": [],
			"image/gif": [],
		},
		multiple: false,
		maxFiles: 1,
	});

	const showCroppedImage = useCallback(async () => {
		try {
			const { blob, previewUrl } = await getCroppedImg(imageSrc, croppedAreaPixels);
			setCroppedImage(previewUrl);
			setFileBlob(blob);
		} catch (e) {
			console.error(e);
		}
	}, [imageSrc, croppedAreaPixels]);

	const handleSave = async () => {
		if (!fileBlob) return;

		const formData = new FormData();
		formData.append("avatar", fileBlob, fileBlob.name);

		uploadAvatar(formData, {
			onSuccess: () => {
				onClose();
				toast.success("Profile Upload Successful!", {
					className: "bg-gradient",
				});
				queryClient.invalidateQueries({ queryKey: ["profile"] });
			},
		});
	};

	return (
		<Dialog open={openModal} onOpenChange={onClose}>
			<DialogContent className="p-6 max-w-md">
				<DialogHeader>
					<DialogTitle>Upload Profile Picture</DialogTitle>
				</DialogHeader>

				{!imageSrc ? (
					<div
						{...getRootProps()}
						className={`h-[120px] border-2 flex items-center justify-center border-dashed rounded-md p-6 cursor-pointer transition ${
							isDragActive ? "border-orange-500 bg-blue-50" : "border-gray-300"
						}`}>
						<Input {...getInputProps()} />
						<p className="text-base text-muted-foreground">Drag & drop your image here, or click to select</p>
					</div>
				) : !croppedImage ? (
					<div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={1}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
							zoomWithScroll={true}
							showGrid={false}
							maxZoom={100}
							restrictPosition={true}
						/>
					</div>
				) : (
					<div className="flex justify-center">
						<img src={croppedImage} alt="Cropped Preview" className="rounded-full w-32 h-32 object-cover" />
					</div>
				)}

				{imageSrc && !croppedImage && (
					<div className="flex flex-col items-center mt-4">
						<Slider
							max={100}
							step={1}
							min={1}
							value={[zoom]}
							onValueChange={(val) => {
								setZoom(val[0]);
							}}
							className="w-full"
						/>

						<div className="flex gap-3 mt-8">
							<Button onClick={showCroppedImage}>Crop</Button>
							<Button onClick={() => setImageSrc(null)} variant="outline">
								Choose Another
							</Button>
						</div>
					</div>
				)}

				{croppedImage && (
					<div className="flex justify-center gap-3 mt-8">
						<Button onClick={handleSave}>Save</Button>
						<Button onClick={() => setCroppedImage(null)} variant={"outline"}>
							Re-Crop
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default UploadAvatarModal;
