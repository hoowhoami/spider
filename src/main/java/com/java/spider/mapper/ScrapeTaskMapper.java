package com.java.spider.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.java.spider.entity.ScrapeTaskEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * Scrape task mapper
 *
 * @author whoami
 */
@Mapper
public interface ScrapeTaskMapper extends BaseMapper<ScrapeTaskEntity> {
}
