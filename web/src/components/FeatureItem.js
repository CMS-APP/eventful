import React from "react";
import Image from "next/image";

export default function FeatureItem({ description, image }) {
  const styles = {
    featureItem: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    featureItemImage: {
      backgroundColor: "#00000033",
      display: "flex",
      padding: 25,
      borderRadius: 50,
    },
    featureItemText: {
      marginTop: 10,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.featureItem}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }} />
        <div style={styles.featureItemImage}>
          <Image src={image} alt={image} width={50} height={50} />
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <div style={styles.featureItemText}>
        <p>{description}</p>
      </div>
    </div>
  );
}
