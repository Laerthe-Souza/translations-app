import { CircleLoader } from "react-spinners";

export default function Loading() {
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <CircleLoader loading={true} color="white" size={150} aria-label="Carregando..." />
    </div>
  )
}