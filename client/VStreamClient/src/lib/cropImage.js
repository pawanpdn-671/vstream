export const getCroppedImg = (imageSrc, cropAreaPixels) => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = imageSrc;
		image.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			canvas.width = cropAreaPixels.width;
			canvas.height = cropAreaPixels.height;

			ctx.drawImage(
				image,
				cropAreaPixels.x,
				cropAreaPixels.y,
				cropAreaPixels.width,
				cropAreaPixels.height,
				0,
				0,
				cropAreaPixels.width,
				cropAreaPixels.height,
			);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Canvas is empty"));
						return;
					}
					blob.name = "avatar.jpeg";
					const previewUrl = URL.createObjectURL(blob);
					resolve({ blob, previewUrl });
				},
				"image/jpeg",
				0.95,
			);
		};
		image.onerror = reject;
	});
};
