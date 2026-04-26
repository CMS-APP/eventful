import "./TextButton.css";

interface TextButtonProps {
  text: string;
  onClick: () => void;
  color: string;
}

export function TextButton({ text, onClick, color }: TextButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-button"
      style={{ color }}
      type="button"
    >
      <h4 className="text-button-text">{text}</h4>
    </button>
  );
}
