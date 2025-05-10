function disableWheelIncrAndDicr() {
  console.log(
    "disableWheelIncrAndDicr called",
    document.querySelectorAll("input[type=number]")
  );
  document.querySelectorAll("input[type=number]").forEach((input) => {
    input.addEventListener(
      "wheel",
      (e) => {
        e.target.blur();
      },
      { passive: false }
    );
  });
}
export default { disableWheelIncrAndDicr };
