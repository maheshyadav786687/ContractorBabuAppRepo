using CleanArchitectureApp.Application.DTOs;
using CleanArchitectureApp.Infrastructure.Services;
using CleanArchitectureApp.Domain.Entities;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Tests.Services
{
    public class TaskServiceTests
    {
        private readonly TaskService _taskService;
        private readonly Mock<DbSet<ProjectTask>> _mockTaskSet;
        private readonly Mock<AppDbContext> _mockContext;

        public TaskServiceTests()
        {
            _mockTaskSet = new Mock<DbSet<ProjectTask>>();
            _mockContext = new Mock<AppDbContext>();
            _mockContext.Setup(c => c.ProjectTasks).Returns(_mockTaskSet.Object);

            _taskService = new TaskService(_mockContext.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldAddTask()
        {
            // Arrange
            var createDto = new CreateTaskDto("Test Task", "High", "Pending", "tenant1", "user1");

            // Act
            var result = await _taskService.CreateAsync(createDto, "tenant1", "user1");

            // Assert
            _mockTaskSet.Verify(t => t.Add(It.IsAny<ProjectTask>()), Times.Once);
            _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
            Assert.Equal("Test Task", result.Name);
        }

        // Additional tests for GetAllAsync, GetByIdAsync, UpdateAsync, DeleteAsync
    }
}