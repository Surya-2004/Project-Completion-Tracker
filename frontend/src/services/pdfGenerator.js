import jsPDF from 'jspdf';

export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF();
    this.currentY = 20;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }

  // Add title with styling
  addTitle(text, fontSize = 20) {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize + 5;
  }

  // Add subtitle
  addSubtitle(text, fontSize = 14) {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize + 3;
  }

  // Add normal text
  addText(text, fontSize = 12) {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize + 2;
  }

  // Check if we need a new page and add it if necessary
  checkPageBreak(requiredHeight = 100) {
    const pageHeight = this.doc.internal.pageSize.height;
    if (this.currentY + requiredHeight > pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 20;
      return true;
    }
    return false;
  }

  // Add a simple table using jsPDF's built-in capabilities
  addSimpleTable(headers, data, startY) {
    const colWidth = this.contentWidth / headers.length;
    const rowHeight = 10;
    let currentY = startY;

    // Draw header row
    this.doc.setFillColor(59, 130, 246);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    // Draw header background
    this.doc.rect(this.margin, currentY, this.contentWidth, rowHeight, 'F');
    
    // Draw header text
    this.doc.setTextColor(255, 255, 255);
    headers.forEach((header, index) => {
      const x = this.margin + (index * colWidth);
      // Truncate text if too long
      let displayText = header;
      while (this.doc.getTextWidth(displayText) > colWidth - 4 && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      this.doc.text(displayText, x + 2, currentY + 6);
    });

    currentY += rowHeight;

    // Draw data rows
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    data.forEach((row, rowIndex) => {
      // Alternate row colors for better readability
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.margin, currentY, this.contentWidth, rowHeight, 'F');
      }
      
      // Draw cell borders
      this.doc.setDrawColor(200, 200, 200);
      row.forEach((cell, index) => {
        const x = this.margin + (index * colWidth);
        this.doc.rect(x, currentY, colWidth, rowHeight, 'S');
        
        // Truncate text if too long
        let cellText = cell.toString();
        while (this.doc.getTextWidth(cellText) > colWidth - 4 && cellText.length > 0) {
          cellText = cellText.slice(0, -1);
        }
        this.doc.text(cellText, x + 2, currentY + 6);
      });
      currentY += rowHeight;
    });

    return currentY;
  }

  // Add a simple bar chart
  addBarChart(title, labels, data, startY) {
    this.addSubtitle(title, 14);
    
    const chartWidth = this.contentWidth;
    const chartHeight = 60;
    const barWidth = chartWidth / labels.length * 0.8;
    const barSpacing = chartWidth / labels.length * 0.2;
    const maxValue = Math.max(...data);
    
    // Draw chart area
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, startY, chartWidth, chartHeight);
    
    // Draw bars
    labels.forEach((label, index) => {
      const barHeight = (data[index] / maxValue) * (chartHeight - 20);
      const x = this.margin + (index * (barWidth + barSpacing)) + barSpacing / 2;
      const y = startY + chartHeight - barHeight - 10;
      
      // Bar color based on value
      const percentage = data[index] / maxValue;
      if (percentage > 0.8) {
        this.doc.setFillColor(34, 197, 94); // Green
      } else if (percentage > 0.5) {
        this.doc.setFillColor(251, 191, 36); // Yellow
      } else {
        this.doc.setFillColor(239, 68, 68); // Red
      }
      
      this.doc.rect(x, y, barWidth, barHeight, 'F');
      
      // Add value on top of bar
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(data[index].toString(), x + barWidth/2 - 5, y - 2);
      
      // Add label below bar
      this.doc.text(label, x + barWidth/2 - 10, startY + chartHeight + 5);
    });
    
    return startY + chartHeight + 20;
  }

  // Add a horizontal bar chart (replacement for pie chart)
  addHorizontalBarChart(title, labels, data, startY) {
    this.addSubtitle(title, 14);
    
    const chartHeight = labels.length * 15 + 20;
    const barWidth = this.contentWidth - 60; // Leave space for labels
    const maxValue = Math.max(...data);
    
    // Colors for bars
    const colors = [
      [59, 130, 246],   // Blue
      [16, 185, 129],   // Green
      [245, 158, 11],   // Yellow
      [239, 68, 68],    // Red
      [139, 92, 246],   // Purple
      [236, 72, 153],   // Pink
      [14, 165, 233],   // Sky Blue
      [168, 85, 247],   // Violet
      [34, 197, 94],    // Emerald
      [251, 146, 60],   // Orange
      [99, 102, 241],   // Indigo
      [244, 63, 94]     // Rose
    ];
    
    labels.forEach((label, index) => {
      const y = startY + (index * 15) + 10;
      const barLength = (data[index] / maxValue) * barWidth;
      const color = colors[index % colors.length];
      
      // Draw label
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(label, this.margin, y + 3);
      
      // Draw bar
      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.rect(this.margin + 50, y, barLength, 8, 'F');
      
      // Draw value
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(data[index].toString(), this.margin + 55 + barLength, y + 3);
    });
    
    return startY + chartHeight;
  }

  // Add a simple pie chart (keeping for compatibility but using horizontal bar chart instead)
  addPieChart(title, labels, data, startY) {
    return this.addHorizontalBarChart(title, labels, data, startY);
  }

  // Add statistics cards with table
  addStatisticsCards(stats) {
    this.addSubtitle('General Statistics', 16);
    
    const headers = ['Metric', 'Value'];
    const data = [
      ['Total Departments', stats.totalDepartments],
      ['Total Students', stats.totalStudents],
      ['Total Teams', stats.totalTeams],
      ['Project Domains', stats.totalProjectDomains],
      ['Completed Projects', stats.completedProjects],
      ['Incomplete Projects', stats.incompleteProjects],
      ['Completion Rate', `${stats.completionPercentage}%`]
    ];

    this.currentY = this.addSimpleTable(headers, data, this.currentY);
    this.currentY += 10;
  }

  // Add stage progress with chart
  addStageProgress(stageProgress) {
    this.addSubtitle('Stage-wise Progress', 16);
    
    const labels = ['Ideation', 'Work Split', 'Local Project', 'Hosting'];
    const data = [
      stageProgress.ideation,
      stageProgress.workSplit,
      stageProgress.localProject,
      stageProgress.hosting
    ];

    this.currentY = this.addBarChart('Teams Completed by Stage', labels, data, this.currentY);
    this.currentY += 10;
  }

  // Add department statistics with chart
  addDepartmentStats(departmentStats) {
    this.addSubtitle('Department Statistics', 16);
    
    const headers = ['Department', 'Teams', 'Students', 'Completed', 'Completion %'];
    const data = departmentStats.map(dept => [
      dept.department,
      dept.teamCount,
      dept.studentCount,
      dept.completedProjects,
      `${dept.averageCompletion}%`
    ]);

    this.currentY = this.addSimpleTable(headers, data, this.currentY);
    this.currentY += 10;

    // Add department completion chart
    const deptLabels = departmentStats.map(dept => dept.department);
    const completionData = departmentStats.map(dept => dept.averageCompletion);
    
    this.currentY = this.addBarChart('Department Completion Rates (%)', deptLabels, completionData, this.currentY);
    this.currentY += 10;
  }

  // Add domain statistics with chart
  addDomainStats(studentsPerDomain, domainCompletionStats, mostPopularDomain) {
    this.addSubtitle('Domain Statistics', 16);
    
    const headers = ['Domain', 'Students', 'Teams', 'Completed', 'Completion %'];
    const data = Object.keys(studentsPerDomain).map(domain => {
      const stats = domainCompletionStats?.[domain];
      const isPopular = domain === mostPopularDomain;
      return [
        domain + (isPopular ? ' (Most Popular)' : ''),
        studentsPerDomain[domain],
        stats?.totalTeams || 0,
        stats?.completedTeams || 0,
        `${stats?.completionRate || 0}%`
      ];
    });

    this.currentY = this.addSimpleTable(headers, data, this.currentY);
    this.currentY += 10;

    // Add domain distribution pie chart
    const domainLabels = Object.keys(studentsPerDomain);
    const domainData = Object.values(studentsPerDomain);
    
    this.currentY = this.addPieChart('Student Distribution by Domain', domainLabels, domainData, this.currentY);
    this.currentY += 10;
  }

  // Add team details with table
  addTeamDetails(teams) {
    this.addSubtitle('Team Details', 16);
    
    const headers = ['Team #', 'Project Title', 'Domain', 'Status', 'GitHub', 'Hosted URL'];
    const data = teams.map(team => [
      team.teamNumber || 'N/A',
      team.projectTitle || 'N/A',
      team.domain || 'N/A',
      team.completed ? 'Completed' : 'In Progress',
      team.githubUrl || 'N/A',
      team.hostedUrl || 'N/A'
    ]);

    this.currentY = this.addSimpleTable(headers, data, this.currentY);
    this.currentY += 10;
  }

  // Add student details per department with table
  addStudentDetails(students) {
    this.addSubtitle('Student Details by Department', 16);
    
    // Group students by department
    const studentsByDept = {};
    students.forEach(student => {
      const deptName = student.department?.name || 'Unknown';
      if (!studentsByDept[deptName]) {
        studentsByDept[deptName] = [];
      }
      studentsByDept[deptName].push(student);
    });

    Object.keys(studentsByDept).forEach(deptName => {
      this.addSubtitle(`${deptName} Department`, 12);
      
      const headers = ['Name', 'Roll Number', 'Email', 'Resume'];
      const data = studentsByDept[deptName].map(student => [
        student.name || 'N/A',
        student.rollNumber || 'N/A',
        student.email || 'N/A',
        student.resumeUrl || 'N/A'
      ]);

      this.currentY = this.addSimpleTable(headers, data, this.currentY);
      this.currentY += 10;
    });
  }

  // Add project completion summary with pie chart
  addProjectCompletionSummary(stats) {
    this.addSubtitle('Project Completion Summary', 16);
    
    const headers = ['Category', 'Count', 'Percentage'];
    const data = [
      ['Completed Projects', stats.completedProjects, `${stats.completionPercentage}%`],
      ['Incomplete Projects', stats.incompleteProjects, `${100 - stats.completionPercentage}%`],
      ['Total Projects', stats.totalTeams, '100%']
    ];

    this.currentY = this.addSimpleTable(headers, data, this.currentY);
    this.currentY += 10;

    // Add completion pie chart
    const labels = ['Completed', 'Incomplete'];
    const chartData = [stats.completedProjects, stats.incompleteProjects];
    
    this.currentY = this.addPieChart('Project Completion Status', labels, chartData, this.currentY);
    this.currentY += 10;
  }

  // Add performance insights
  addPerformanceInsights(stats) {
    this.addSubtitle('Performance Insights', 16);
    
    const insights = [];
    
    if (stats.completionPercentage >= 80) {
      insights.push('Excellent project completion rate!');
    } else if (stats.completionPercentage >= 60) {
      insights.push('Good progress, room for improvement');
    } else {
      insights.push('Need to focus on project completion');
    }

    if (stats.mostPopularDomain) {
      insights.push(`Most popular domain: ${stats.mostPopularDomain}`);
    }

    if (stats.departmentStats?.length > 0) {
      const bestDept = stats.departmentStats.reduce((best, current) => 
        current.averageCompletion > best.averageCompletion ? current : best
      );
      insights.push(`Best performing department: ${bestDept.department} (${bestDept.averageCompletion}%)`);
    }

    insights.forEach(insight => {
      this.addText(`• ${insight}`, 10);
    });
    
    this.currentY += 10;
  }

  // Add footer with additional information
  addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    this.currentY = pageHeight - 30;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(128, 128, 128);
    
    this.doc.text('This report was generated automatically by the Project Completion Tracker System.', this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text('For questions or support, please contact the system administrator.', this.margin, this.currentY);
  }

  // Generate the complete PDF
  async generatePDF(stats, teams, students) {
    try {
      // Add header
      this.addTitle('Project Completion Tracker Report', 24);
      this.addText(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 10);
      this.currentY += 10;

      // Add statistics
      this.addStatisticsCards(stats);
      
      // Check page break before stage progress
      this.checkPageBreak(100);

      // Add stage progress
      this.addStageProgress(stats.stageProgress);
      
      // Check page break before department stats
      this.checkPageBreak(150);

      // Add department statistics
      this.addDepartmentStats(stats.departmentStats);
      
      // Check page break before domain stats
      this.checkPageBreak(150);

      // Add domain statistics
      this.addDomainStats(stats.studentsPerDomain, stats.domainCompletionStats, stats.mostPopularDomain);
      
      // Check page break before project completion summary
      this.checkPageBreak(150);

      // Add project completion summary
      this.addProjectCompletionSummary(stats);
      
      // Check page break before performance insights
      this.checkPageBreak(100);

      // Add performance insights
      this.addPerformanceInsights(stats);
      
      // Check page break before team details
      this.checkPageBreak(100);

      // Add team details
      this.addTeamDetails(teams);
      
      // Check page break before student details
      this.checkPageBreak(100);

      // Add student details
      this.addStudentDetails(students);

      // Add footer
      this.addFooter();

      // Save the PDF
      const fileName = `Project_Completion_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export default PDFGenerator; 