import React, { useEffect, useState } from "react";

const ImageViewer = ({ url }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetch(
        url
        //   new URLSearchParams({
        //     generation: 1720941911109063,
        //     alt: "media",
        //   })
      );
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageSrc(imageUrl);
    };

    fetchImage();
  }, [url]);

  return (
    <div>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Fetched Content"
          style={{ maxWidth: "100%", maxHeight: "500px" }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ImageViewer;
