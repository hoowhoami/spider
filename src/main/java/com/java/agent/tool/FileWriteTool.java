package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * File write tool
 * @author whoami
 */
@Slf4j
@Component
public class FileWriteTool extends AbstractAgentTool {

    @Tool(description = "Write content to specified file path. Creates parent directories if needed.")
    public String writeFile(String filePath, String content) {
        try {
            Path path = Path.of(filePath);
            if (path.getParent() != null) {
                Files.createDirectories(path.getParent());
            }
            Files.writeString(path, content);
            return "File written successfully: " + filePath;
        } catch (Exception e) {
            return "Error writing file: " + e.getMessage();
        }
    }
}
