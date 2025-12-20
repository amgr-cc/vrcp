# makefile
.DEFAULT_GOAL := help
.PHONY : help
help:   # show this list
	@echo "---- list of available commands ---"
	@grep -E '^[[:alnum:]_/-]+ *:.*?#.*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?# "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
# ----

.PHONY : run run-tauri
run:  # run the application (ts-front only)
	@npm run dev
run-tauri:  # run the tauri application (ts-front and rust-backend)
	@npm run tauri dev

.PHONY : gen-bindings
gen-bindings:  # generate the bindings for commands-wrapper
	@cd src-tauri && cargo run --bin gen_bindings
.PHONY : gen-icons
gen-icons:  # generate the icons for the application, from PNG image (1024x1024)
	@npm run tauri icon src/assets/icon.png
	@echo "removing unused icons..."
	@rm -r src-tauri/icons/android src-tauri/icons/ios  # remove mobile icons
	@rm src-tauri/icons/Square*.png src-tauri/icons/StoreLogo.png  # remove MSstore icon
.PHONY: lint 
lint: # lint the codebase
# @npx eslint . --fix
	@npx prettier --write "**/*.tsx"
	@echo "tsc checking..." && npx tsc --noEmit && echo "done"
# @npx next lint --fix
