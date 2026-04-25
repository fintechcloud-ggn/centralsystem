const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;
const TARGET_IMAGE_UPLOAD_BYTES = 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const MIN_IMAGE_DIMENSION = 600;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read the selected image"));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to process the selected image"));
        return;
      }

      resolve(blob);
    }, type, quality);
  });

const buildResizedCanvas = (image, maxDimension) => {
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to process the selected image");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas;
};

const replaceExtension = (filename, extension) => {
  const safeName = filename || "image";
  const lastDotIndex = safeName.lastIndexOf(".");
  const baseName = lastDotIndex > 0 ? safeName.slice(0, lastDotIndex) : safeName;
  return `${baseName}.${extension}`;
};

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getUploadErrorMessage = (error, fallback) => {
  if (error?.response?.status === 413) {
    return "Image is too large. Please choose a smaller photo.";
  }

  const responseData = error?.response?.data;
  const responseError = responseData?.error ?? responseData?.message ?? responseData;

  if (!responseError) {
    return error?.message || fallback;
  }

  if (typeof responseError === "string") {
    return responseError;
  }

  if (Array.isArray(responseError)) {
    const firstMessage = responseError.find((item) => typeof item === "string");
    return firstMessage || fallback;
  }

  if (typeof responseError === "object") {
    if (typeof responseError.message === "string") {
      return responseError.message;
    }

    const firstStringValue = Object.values(responseError).find((value) => typeof value === "string");
    if (firstStringValue) {
      return firstStringValue;
    }
  }

  return fallback;
};

export const prepareImageForUpload = async (file) => {
  if (!file) {
    return null;
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  if (file.size <= TARGET_IMAGE_UPLOAD_BYTES) {
    return file;
  }

  const image = await loadImage(file);
  let maxDimension = MAX_IMAGE_DIMENSION;
  let bestBlob = null;
  let bestName = replaceExtension(file.name, "jpg");

  while (maxDimension >= MIN_IMAGE_DIMENSION) {
    const canvas = buildResizedCanvas(image, maxDimension);

    for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
      const blob = await canvasToBlob(canvas, "image/jpeg", quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= TARGET_IMAGE_UPLOAD_BYTES) {
        return new File([blob], bestName, { type: "image/jpeg" });
      }
    }

    maxDimension = Math.round(maxDimension * 0.8);
  }

  if (bestBlob && bestBlob.size <= MAX_IMAGE_UPLOAD_BYTES) {
    return new File([bestBlob], bestName, { type: "image/jpeg" });
  }

  throw new Error(
    `Image is too large. Please upload a photo under ${formatFileSize(MAX_IMAGE_UPLOAD_BYTES)}.`
  );
};

export { MAX_IMAGE_UPLOAD_BYTES };
