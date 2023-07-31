import { BarLoader } from "react-spinners";

function LoadingBar() {
  return (
    <BarLoader
      color='#E900FF'
      cssOverride={{
        width: "30vw",
        maxWidth: "350px",
        minWidth: "250px",
      }}
    />
  );
}

export default LoadingBar;