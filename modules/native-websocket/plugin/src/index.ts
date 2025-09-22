import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withInfoPlist
} from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";


// https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial/#create-a-new-config-plugin

type ExtraConfig = {
  moduleKey: string;
};



const withIOS = (config: ExpoConfig, extra: ExtraConfig) => {
  config = withInfoPlist(config, (config) => {
    config.modResults["MODULE_KEY"] = extra.moduleKey;
    return config;
  });
  
  return config;
}

const withAndroid = (config: ExpoConfig, extra: ExtraConfig) => {
  config = withAndroidManifest(config, (config) => { // Api key
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      "MODULE_KEY",
      extra.moduleKey
    );
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
}





// apply config plugin
const withModuleConfig: ConfigPlugin<ExtraConfig> = (config, extra) => {
  config = withIOS(config, extra);
  config = withAndroid(config, extra);
  return config;
};

export default withModuleConfig;
