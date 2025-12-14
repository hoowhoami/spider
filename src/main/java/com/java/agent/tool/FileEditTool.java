package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * File edit tool
 * @author whoami
 */
@Slf4j
@Component
public class FileEditTool extends AbstractAgentTool {

    @Tool(description = "Replace text in file. Replaces all occurrences of oldText with newText.")
    public String editFile(String filePath, String oldText, String newText) {
        try {
            Path path = Path.of(filePath);
            if (!Files.exists(path)) {
                return "Error: File not found: " + filePath;
            }

            String content = Files.readString(path);
            if (!content.contains(oldText)) {
                return "Error: Text to replace not found in file";
            }

            String newContent = content.replace(oldText, newText);
            Files.writeString(path, newContent);
            return "File edited successfully: " + filePath;
        } catch (Exception e) {
            return "Error editing file: " + e.getMessage();
        }
    }
}
