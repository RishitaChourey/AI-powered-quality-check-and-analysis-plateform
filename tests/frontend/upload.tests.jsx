import { render, screen, fireEvent } from "@testing-library/react";
import Upload from "../../src/components/Upload";

test("upload button disabled initially", () => {
  render(<Upload />);
  expect(screen.getByText("Upload")).toBeDisabled();
});

test("button enabled after selecting file", () => {
  render(<Upload />);
  
  fireEvent.change(screen.getByTestId("file-input"), {
    target: { files: [new File(["dummy"], "sample.mp4", { type: "video/mp4" })] },
  });

  expect(screen.getByText("Upload")).toBeEnabled();
});
