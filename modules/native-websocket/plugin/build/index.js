"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withIOS = (config, extra) => {
    config = (0, config_plugins_1.withInfoPlist)(config, (config) => {
        config.modResults["MODULE_KEY"] = extra.moduleKey;
        return config;
    });
    return config;
};
const withAndroid = (config, extra) => {
    config = (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        const mainApplication = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        config_plugins_1.AndroidConfig.Manifest.addMetaDataItemToMainApplication(mainApplication, "MODULE_KEY", extra.moduleKey);
        return config;
    });
    // config = withAppBuildGradle(config, (config) => { // add dependency for okhttp
    //   const buildGradle = config.modResults.contents;
    //   if (buildGradle.includes('com.squareup.okhttp3:okhttp')) return config;
    //   const dependenciesItems = [
    //     "com.squareup.okhttp3:okhttp:4.12.0",
    //     "com.google.code.gson:gson:2.11.0",
    //     "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3",
    //     "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
    //   ]
    //   config.modResults.contents = buildGradle.replace(
    //     `dependencies {`,
    //     `dependencies {\n    // custom-expo-module ${dependenciesItems.map(
    //       item => `\n    implementation("${item}")`
    //     ).join('')}\n`
    //   );
    //   return config;
    // });
    //
    return config;
};
// apply config plugin
const withModuleConfig = (config, extra) => {
    config = withIOS(config, extra);
    config = withAndroid(config, extra);
    return config;
};
exports.default = withModuleConfig;
