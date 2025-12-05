package com.java.agent.core;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@Component
public class ToolRegistry implements InitializingBean {

    private static final Map<String, ToolPlugin> PLUGINS = new ConcurrentHashMap<>();

    private final ToolValidator validator;
    private final ApplicationContext applicationContext;


    public void register(ToolPlugin plugin) {
        validator.validate(plugin);
        String name = plugin.getName();
        if (PLUGINS.containsKey(name)) {
            log.warn("Tool {} already exists, replacing", name);
            unregister(name);
        }
        plugin.onLoad();
        PLUGINS.put(name, plugin);
        log.info("Tool {} registered", name);
    }

    public void unregister(String name) {
        ToolPlugin plugin = PLUGINS.remove(name);
        if (plugin != null) {
            plugin.onUnload();
            log.info("Tool {} unregistered", name);
        }
    }

    public ToolPlugin getTool(String name) {
        return PLUGINS.get(name);
    }

    public List<AgentTool> getAllTools() {
        return List.copyOf(PLUGINS.values());
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        Map<String, ToolPlugin> maps = applicationContext.getBeansOfType(ToolPlugin.class);
        if (MapUtils.isNotEmpty(maps)) {
            Collection<ToolPlugin> plugins = maps.values();
            log.info("Registering {} tool plugins", plugins.size());
            plugins.forEach(this::register);
            log.info("All tool plugins registered successfully");
        }
    }

}