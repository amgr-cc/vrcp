// desktop/src-tauri/src/bin/gen_bindings.rs

use specta_typescript::Typescript;
// desktopクレートから関数をインポート
use vrcp_lib::create_specta_builder; 

fn main() {
    println!("🚀 Generating bindings...");

    // ▼ マクロではなく関数を呼ぶだけでOK
    let builder = create_specta_builder();

    builder
        .export(
            Typescript::default()
                .formatter(specta_typescript::formatter::prettier)
                .header("// @ts-nocheck\n/* eslint-disable */"),
            "../src/lib/bindings.ts"
        )
        .expect("Failed to export typescript bindings");
        
    println!("✅ Bindings generated at ../src/lib/bindings.ts");
}