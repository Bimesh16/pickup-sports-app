package com.bmessi.pickupsportsapp.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "chat.moderation")
public class ProfanityFilterProperties {
    private boolean enabled = true;
    private boolean reject = false;
    private List<String> words = java.util.List.of("badword");
    /**
     * Optional path to a newline-delimited dictionary on classpath: or file: URL.
     */
    private String dictionaryPath;

    /**
     * If true and dictionaryPath refers to a filesystem path, reload the dictionary on file changes.
     */
    private boolean reloadOnChange = false;

    public boolean isEnabled() {
        return enabled;
    }
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    public boolean isReject() {
        return reject;
    }
    public void setReject(boolean reject) {
        this.reject = reject;
    }
    public List<String> getWords() {
        return words;
    }
    public void setWords(List<String> words) {
        this.words = words;
    }

    public String getDictionaryPath() {
        return dictionaryPath;
    }
    public void setDictionaryPath(String dictionaryPath) {
        this.dictionaryPath = dictionaryPath;
    }

    public boolean isReloadOnChange() {
        return reloadOnChange;
    }
    public void setReloadOnChange(boolean reloadOnChange) {
        this.reloadOnChange = reloadOnChange;
    }
}
