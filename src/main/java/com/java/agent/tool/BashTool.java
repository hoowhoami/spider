package com.java.agent.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

/**
 * Bash execution tool
 * @author whoami
 */
@Slf4j
@Component
public class BashTool extends AbstractAgentTool {

    @Tool(description = "Execute bash command and return output. Timeout defaults to 30 seconds if not specified.")
    public String executeBash(String command) {
        try {
            ProcessBuilder pb = new ProcessBuilder("bash", "-c", command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return "Command timed out after 30 seconds";
            }

            int exitCode = process.exitValue();
            String result = output.toString();
            return exitCode == 0 ? result : "Exit code: " + exitCode + "\n" + result;
        } catch (Exception e) {
            return "Error executing command: " + e.getMessage();
        }
    }
}
