import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBFBF7",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 80,
            background: "#12AD67",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 180,
            fontWeight: 700,
          }}
        >
          H
        </div>
      </div>
    ),
    size,
  );
}
