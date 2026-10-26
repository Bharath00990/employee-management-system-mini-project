package com.ems.repository;

import com.ems.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(String status);
    List<Project> findByProjectManagerId(Long managerEmployeeId);

    @Query("SELECT p FROM Project p WHERE " +
           "(cast(:status as string) IS NULL OR :status = '' OR p.status = :status) AND " +
           "(cast(:search as string) IS NULL OR :search = '' OR LOWER(p.projectName) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    List<Project> filterProjects(@Param("status") String status, @Param("search") String search);

    Long countByStatus(String status);
}
