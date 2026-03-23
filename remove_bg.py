from PIL import Image
import os

def remove_black_background(input_path, output_path, threshold=40):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return

    # Load the image
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is nearly black (R, G, B < threshold)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Change it to transparent
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Success: Saved transparent PNG to {output_path}")

if __name__ == "__main__":
    input_file = r"c:\Users\anonimo\Desktop\Agraviti\aRCHIVOS\logo-club.jpeg"
    output_file = r"c:\Users\anonimo\Desktop\Agraviti\aRCHIVOS\logo-club.png"
    remove_black_background(input_file, output_file)
