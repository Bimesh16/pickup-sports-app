package com.bmessi.pickupsportsapp.service.chat;

import com.bmessi.pickupsportsapp.common.config.properties.ProfanityFilterProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@EnableConfigurationProperties(ProfanityFilterProperties.class)
public class ProfanityFilterService {

    private final ProfanityFilterProperties props;

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private volatile Set<String> dictionary;
    private volatile Pattern pattern;

    public ProfanityFilterService(ProfanityFilterProperties props) {
        this.props = props;
        reloadFromConfig();
    }

    private void reloadFromConfig() {
        this.dictionary = loadDictionary(props);
        this.pattern = compilePattern(this.dictionary);
    }

    private static Pattern compilePattern(Set<String> dict) {
        String joined = (dict == null || dict.isEmpty()) ? "" : dict.stream()
                .map(Pattern::quote)
                .collect(Collectors.joining("|"));
        return joined.isEmpty() ? null : Pattern.compile("\\b(" + joined + ")\\b", Pattern.CASE_INSENSITIVE);
    }

    private static Set<String> loadDictionary(ProfanityFilterProperties props) {
        Set<String> base = props.getWords().stream()
                .filter(w -> w != null && !w.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toCollection(java.util.HashSet::new));
        String path = props.getDictionaryPath();
        if (path == null || path.isBlank()) return java.util.Collections.unmodifiableSet(base);
        try {
            java.util.List<String> lines;
            if (path.startsWith("classpath:")) {
                String res = path.substring("classpath:".length());
                try (java.io.InputStream is = ProfanityFilterService.class.getResourceAsStream(res.startsWith("/") ? res : "/" + res)) {
                    if (is != null) {
                        lines = new java.io.BufferedReader(new java.io.InputStreamReader(is))
                                .lines().toList();
                    } else {
                        lines = java.util.List.of();
                    }
                }
            } else if (path.startsWith("file:")) {
                java.nio.file.Path p = java.nio.file.Paths.get(path.substring("file:".length()));
                lines = java.nio.file.Files.readAllLines(p);
            } else {
                java.nio.file.Path p = java.nio.file.Paths.get(path);
                lines = java.nio.file.Files.readAllLines(p);
            }
            for (String l : lines) {
                if (l == null) continue;
                String t = l.trim().toLowerCase();
                if (!t.isBlank() && !t.startsWith("#")) base.add(t);
            }
        } catch (Exception ignore) {
        }
        return java.util.Collections.unmodifiableSet(base);
    }

    public boolean isEnabled() {
        return props.isEnabled() && pattern != null;
    }

    public String sanitize(String content) {
        if (!isEnabled() || content == null || content.isBlank()) return content;
        lock.readLock().lock();
        try {
            return pattern.matcher(content).replaceAll("****");
        } finally {
            lock.readLock().unlock();
        }
    }

    public boolean containsProfanity(String content) {
        if (!isEnabled() || content == null) return false;
        lock.readLock().lock();
        try {
            return pattern.matcher(content).find();
        } finally {
            lock.readLock().unlock();
        }
    }

    public boolean shouldReject() {
        return props.isReject();
    }

    // --- Admin API ---

    public java.util.List<String> listWords() {
        lock.readLock().lock();
        try {
            return dictionary.stream().sorted().toList();
        } finally {
            lock.readLock().unlock();
        }
    }

    public void replaceAllWords(java.util.List<String> words) {
        lock.writeLock().lock();
        try {
            Set<String> newDict = words == null ? java.util.Set.of() : words.stream()
                    .filter(w -> w != null && !w.isBlank())
                    .map(String::toLowerCase)
                    .collect(Collectors.toCollection(java.util.HashSet::new));
            this.dictionary = java.util.Collections.unmodifiableSet(newDict);
            this.pattern = compilePattern(this.dictionary);
            props.setWords(this.dictionary.stream().toList());
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void addWord(String word) {
        if (word == null || word.isBlank()) return;
        lock.writeLock().lock();
        try {
            java.util.Set<String> copy = new java.util.HashSet<>(this.dictionary);
            copy.add(word.trim().toLowerCase());
            this.dictionary = java.util.Collections.unmodifiableSet(copy);
            this.pattern = compilePattern(this.dictionary);
            props.setWords(this.dictionary.stream().toList());
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void removeWord(String word) {
        if (word == null || word.isBlank()) return;
        lock.writeLock().lock();
        try {
            java.util.Set<String> copy = new java.util.HashSet<>(this.dictionary);
            copy.remove(word.trim().toLowerCase());
            this.dictionary = java.util.Collections.unmodifiableSet(copy);
            this.pattern = compilePattern(this.dictionary);
            props.setWords(this.dictionary.stream().toList());
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void setEnabled(boolean enabled) {
        props.setEnabled(enabled);
    }

    public void setReject(boolean reject) {
        props.setReject(reject);
    }

    public void reloadFromFile() {
        lock.writeLock().lock();
        try {
            Set<String> loaded = loadDictionary(props);
            this.dictionary = loaded;
            this.pattern = compilePattern(this.dictionary);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
