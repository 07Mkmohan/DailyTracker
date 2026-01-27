import "../styles/toast.css";

export default function Toast({ message, show }) {
  return show ? <div className="toast">{message}</div> : null;
}
