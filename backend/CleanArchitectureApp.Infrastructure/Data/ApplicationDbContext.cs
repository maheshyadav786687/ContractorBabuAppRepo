using CleanArchitectureApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitectureApp.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Phase 1: Multi-Tenant Tables
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<User> Users { get; set; }

    // Phase 2: Core Construction Entities
    public DbSet<Client> Clients { get; set; }
    public DbSet<Site> Sites { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectPhase> ProjectPhases { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Quotation> Quotations { get; set; }
    public DbSet<QuotationItem> QuotationItems { get; set; }
    public DbSet<ProjectTask> ProjectTasks { get; set; }
    public DbSet<TaskDependency> TaskDependencies { get; set; }

    // Phase 3: Material Management Entities
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<MaterialTransaction> MaterialTransactions { get; set; }

    // Phase 4: Finance & Payroll Entities
    public DbSet<ExpenseHead> ExpenseHeads { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    public DbSet<Labor> Labors { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<Payroll> Payrolls { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureTenantEntities(modelBuilder);
        ConfigurePhase2Entities(modelBuilder);
        ConfigurePhase3Entities(modelBuilder);
        ConfigurePhase4Entities(modelBuilder);
        SeedData(modelBuilder);
    }

    private void ConfigureTenantEntities(ModelBuilder modelBuilder)
    {
        // Configure Tenant entity
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CompanyCode).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.GSTNumber).HasMaxLength(15);
            entity.Property(e => e.PANNumber).HasMaxLength(10);
            
            entity.HasIndex(e => e.CompanyCode).IsUnique();
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            
            entity.HasIndex(e => new { e.TenantId, e.Username }).IsUnique();
            entity.HasIndex(e => new { e.TenantId, e.Email }).IsUnique();
            
            entity.HasOne(e => e.Tenant)
                .WithMany(t => t.Users)
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private void ConfigurePhase2Entities(ModelBuilder modelBuilder)
    {
        // Configure Client
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContactPerson).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            
            entity.HasIndex(e => new { e.TenantId, e.Email });
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Site
        modelBuilder.Entity<Site>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            
            entity.HasOne(e => e.Client)
                .WithMany(c => c.Sites)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProjectCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.ProjectType).HasMaxLength(50);
            entity.Property(e => e.EstimatedBudget).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ActualCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ContractValue).HasColumnType("decimal(18,2)");
            
            entity.HasIndex(e => new { e.TenantId, e.ProjectCode }).IsUnique();
            
            entity.HasOne(e => e.Client)
                .WithMany(c => c.Projects)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Site)
                .WithMany(s => s.Projects)
                .HasForeignKey(e => e.SiteId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.ProjectManager)
                .WithMany()
                .HasForeignKey(e => e.ProjectManagerId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure ProjectPhase
        modelBuilder.Entity<ProjectPhase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50);
            
            entity.HasOne(e => e.Project)
                .WithMany(p => p.Phases)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            entity.HasOne(e => e.Supervisor)
                .WithMany()
                .HasForeignKey(e => e.SupervisorId)
                .OnDelete(DeleteBehavior.SetNull);
            
            // NO CASCADE to Tenant - prevent multiple cascade paths
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Item
        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(20);
            entity.Property(e => e.StandardRate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MinRate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MaxRate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.GSTPercentage).HasColumnType("decimal(18,2)");
            
            entity.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Quotation
        modelBuilder.Entity<Quotation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuotationNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxPercentage).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountPercentage).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.GrandTotal).HasColumnType("decimal(18,2)");
            
            entity.HasIndex(e => new { e.TenantId, e.QuotationNumber }).IsUnique();
            
            entity.HasOne(e => e.Project)
                .WithMany(p => p.Quotations)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            entity.HasOne(e => e.Site)
                .WithMany(s => s.Quotations)
                .HasForeignKey(e => e.SiteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure QuotationItem
        modelBuilder.Entity<QuotationItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Width).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Length).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Height).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Area).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Quotation)
                .WithMany(q => q.Items)
                .HasForeignKey(e => e.QuotationId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure ProjectTask
        modelBuilder.Entity<ProjectTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TaskCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(20);
            
            entity.HasIndex(e => new { e.TenantId, e.TaskCode }).IsUnique();
            
            entity.HasOne(e => e.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade
            
            entity.HasOne(e => e.ProjectPhase)
                .WithMany(pp => pp.Tasks)
                .HasForeignKey(e => e.ProjectPhaseId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.AssignedTo)
                .WithMany()
                .HasForeignKey(e => e.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure TaskDependency
        modelBuilder.Entity<TaskDependency>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DependencyType).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.PredecessorTask)
                .WithMany(t => t.DependentTasks)
                .HasForeignKey(e => e.PredecessorTaskId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.SuccessorTask)
                .WithMany(t => t.Dependencies)
                .HasForeignKey(e => e.SuccessorTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private void ConfigurePhase3Entities(ModelBuilder modelBuilder)
    {
        // Configure Vendor
        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContactPerson).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            
            entity.HasIndex(e => new { e.TenantId, e.Email });
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure PurchaseOrder
        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PONumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.GrandTotal).HasColumnType("decimal(18,2)");
            
            entity.HasIndex(e => new { e.TenantId, e.PONumber }).IsUnique();
            
            entity.HasOne(e => e.Vendor)
                .WithMany(v => v.PurchaseOrders)
                .HasForeignKey(e => e.VendorId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure PurchaseOrderItem
        modelBuilder.Entity<PurchaseOrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Unit).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ReceivedQuantity).HasColumnType("decimal(18,4)");
            
            entity.HasOne(e => e.PurchaseOrder)
                .WithMany(p => p.Items)
                .HasForeignKey(e => e.PurchaseOrderId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Item)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Inventory
        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.ReorderLevel).HasColumnType("decimal(18,4)");
            entity.Property(e => e.AverageRate).HasColumnType("decimal(18,2)");
            
            entity.HasIndex(e => new { e.TenantId, e.ItemId }).IsUnique();
            

            
            entity.HasOne(e => e.Item)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure MaterialTransaction
        modelBuilder.Entity<MaterialTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ReferenceType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ReferenceId).HasMaxLength(50);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
            

            
            entity.HasOne(e => e.Item)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private void ConfigurePhase4Entities(ModelBuilder modelBuilder)
    {
        // Configure ExpenseHead
        modelBuilder.Entity<ExpenseHead>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Expense
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasMaxLength(50);
            
            entity.HasOne(e => e.ExpenseHead)
                .WithMany()
                .HasForeignKey(e => e.ExpenseHeadId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);
            

            
            entity.HasOne(e => e.SpentBy)
                .WithMany()
                .HasForeignKey(e => e.SpentById)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Invoice
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RetentionAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TDSAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.GrandTotal).HasColumnType("decimal(18,2)");
            
            entity.HasIndex(e => new { e.TenantId, e.InvoiceNumber }).IsUnique();
            
            entity.HasOne(e => e.Project)
                .WithMany()
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure InvoiceItem
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,4)");
            entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxPercentage).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Labor
        modelBuilder.Entity<Labor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LaborType).HasMaxLength(50);
            entity.Property(e => e.DailyWage).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Attendance
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OvertimeHours).HasColumnType("decimal(18,2)");
            entity.Property(e => e.WageForDay).HasColumnType("decimal(18,2)");
            
            entity.HasOne(e => e.Labor)
                .WithMany()
                .HasForeignKey(e => e.LaborId)
                .OnDelete(DeleteBehavior.Restrict);
            

            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Configure Payroll
        modelBuilder.Entity<Payroll>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TotalOvertimeHours).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalWageAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AdvanceDeduction).HasColumnType("decimal(18,2)");
            entity.Property(e => e.BonusAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.NetPayable).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasMaxLength(50);
            
            entity.HasOne(e => e.Labor)
                .WithMany()
                .HasForeignKey(e => e.LaborId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Generate consistent ULIDs for seed data
        var tenantId = "01JEYQZ0Z0Z0Z0Z0Z0Z0Z0ZZZ1"; // Fixed ULID for demo tenant
        var adminId = "01JEYQZ0Z0Z0Z0Z0Z0Z0Z0ZZZ2"; // Fixed ULID for admin
        var managerId = "01JEYQZ0Z0Z0Z0Z0Z0Z0Z0ZZZ3"; // Fixed ULID for manager
        var supervisorId = "01JEYQZ0Z0Z0Z0Z0Z0Z0Z0ZZZ4"; // Fixed ULID for supervisor

        // Seed default tenant
        modelBuilder.Entity<Tenant>().HasData(
            new Tenant
            {
                Id = tenantId,
                CompanyName = "Demo Construction Company",
                CompanyCode = "DEMO001",
                Email = "admin@democonstruction.com",
                Phone = "+91 9876543210",
                Address = "123 Construction Street",
                City = "Mumbai",
                State = "Maharashtra",
                Country = "India",
                PinCode = "400001",
                SubscriptionPlan = "Premium",
                SubscriptionStartDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                SubscriptionEndDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                MaxUsers = 50,
                MaxProjects = 100,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed default users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                TenantId = tenantId,
                Username = "admin",
                Email = "admin@democonstruction.com",
                PasswordHash = "admin",
                FirstName = "Admin",
                LastName = "User",
                Role = "Admin",
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = managerId,
                TenantId = tenantId,
                Username = "manager",
                Email = "manager@democonstruction.com",
                PasswordHash = "manager",
                FirstName = "Project",
                LastName = "Manager",
                Role = "ProjectManager",
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = supervisorId,
                TenantId = tenantId,
                Username = "supervisor",
                Email = "supervisor@democonstruction.com",
                PasswordHash = "supervisor",
                FirstName = "Site",
                LastName = "Supervisor",
                Role = "SiteSupervisor",
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
