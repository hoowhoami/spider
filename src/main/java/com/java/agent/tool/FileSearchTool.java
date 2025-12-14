package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

/**
 * File search tool
 * @author whoami
 */
@Slf4j
@Component
public class FileSearchTool extends AbstractAgentTool {

    @Tool(description = "Search for files matching pattern in directory. Searches up to 5 levels deep.")
    public String searchFiles(String directory, String pattern) {
        try {
            Path startPath = Path.of(directory);
            if (!Files.exists(startPath)) {
                return "Error: Directory not found: " + directory;
            }

            try (Stream<Path> paths = Files.walk(startPath, 5)) {
                List<String> matches = paths
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().contains(pattern))
                    .map(Path::toString)
                    .limit(100)
                    .toList();

                if (matches.isEmpty()) {
                    return "No files found matching pattern: " + pattern;
                }
                return "Found " + matches.size() + " files:\n" + String.join("\n", matches);
            }
        } catch (Exception e) {
            return "Error searching files: " + e.getMessage();
        }
    }
}
