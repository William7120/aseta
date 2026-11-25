import os
import sys
import glob

def convert_all_menu_pdfs():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    pdf_dir = os.path.join(base_dir, 'data', 'pdf')
    
    if not os.path.exists(pdf_dir):
        print(f"Directory not found: {pdf_dir}")
        return

    # Try pypdfium2 first
    converter = None
    try:
        import pypdfium2 as pdfium
        converter = 'pdfium'
    except ImportError:
        pass

    # Fallback to pdf2image
    if not converter:
        try:
            from pdf2image import convert_from_path
            converter = 'pdf2image'
        except ImportError:
            pass

    # Fallback to pdftoppm CLI
    if not converter:
        import shutil
        if shutil.which('pdftoppm'):
            converter = 'pdftoppm'

    print(f"Using converter: {converter}")
    if not converter:
        print("Warning: No PDF to image converter available (install pypdfium2, pdf2image, or poppler-utils)")
        return

    pdf_files = glob.glob(os.path.join(pdf_dir, 'thuc_don_tuan_*.pdf')) + glob.glob(os.path.join(pdf_dir, 'lich_thi_*.pdf'))
    for pdf_path in pdf_files:
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        png_path = os.path.join(pdf_dir, f"{base_name}.png")
        
        # Convert if png doesn't exist or pdf is newer
        if not os.path.exists(png_path) or os.path.getmtime(pdf_path) > os.path.getmtime(png_path):
            print(f"Converting {os.path.basename(pdf_path)} -> {os.path.basename(png_path)}...")
            try:
                if converter == 'pdfium':
                    import pypdfium2 as pdfium
                    pdf = pdfium.PdfDocument(pdf_path)
                    page = pdf[0]
                    img = page.render(scale=2).to_pil()
                    img.save(png_path, quality=95)
                elif converter == 'pdf2image':
                    from pdf2image import convert_from_path
                    images = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=200)
                    if images:
                        images[0].save(png_path, 'PNG')
                elif converter == 'pdftoppm':
                    import subprocess
                    prefix = os.path.join(pdf_dir, f"{base_name}_temp")
                    subprocess.run(['pdftoppm', '-png', '-r', '150', '-f', '1', '-l', '1', pdf_path, prefix], check=True)
                    gen_files = glob.glob(f"{prefix}*.png")
                    if gen_files:
                        if os.path.exists(png_path):
                            os.remove(png_path)
                        os.rename(gen_files[0], png_path)
                print(f"-> Saved: {os.path.basename(png_path)}")
            except Exception as e:
                print(f"Error converting {pdf_path}: {e}")

    # Ensure thuc_don_latest.png matches the newest week
    latest_pdf = os.path.join(pdf_dir, 'thuc_don_latest.pdf')
    latest_png = os.path.join(pdf_dir, 'thuc_don_latest.png')
    # Find highest week number
    highest_week = 0
    highest_png = None
    for p in glob.glob(os.path.join(pdf_dir, 'thuc_don_tuan_*.png')):
        try:
            w = int(os.path.basename(p).replace('thuc_don_tuan_', '').replace('.png', ''))
            if w > highest_week:
                highest_week = w
                highest_png = p
        except ValueError:
            pass

    if highest_png and os.path.exists(highest_png):
        import shutil
        shutil.copyfile(highest_png, latest_png)
        print(f"Copied {os.path.basename(highest_png)} -> thuc_don_latest.png")

if __name__ == '__main__':
    convert_all_menu_pdfs()
