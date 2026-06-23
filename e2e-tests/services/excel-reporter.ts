import ExcelJS from 'exceljs'
import path from 'path'
import fs from 'fs'

export class ExcelReporter {
    private results: { id: number; title: string; status: string; duration: string; timestamp: string }[] = []
    private platform: string

    constructor(options: { platform: string }) {
        this.platform = options.platform
    }

    public addResult(testTitle: string, status: 'pass' | 'fail' | 'skip', duration: number) {
        this.results.push({
            id: this.results.length + 1,
            title: testTitle,
            status,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        })
    }

    public async generateReport() {
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'StudyMind AI QA Bot'
        workbook.created = new Date()

        const sheet = workbook.addWorksheet(`${this.platform} Report`, {
            pageSetup: { fitToPage: true, orientation: 'landscape' },
        })

        // ── Summary Section ─────────────────────────────────
        const totalTests = this.results.length
        const passes = this.results.filter(r => r.status === 'pass').length
        const fails = this.results.filter(r => r.status === 'fail').length
        const skipped = this.results.filter(r => r.status === 'skip').length
        const accuracy = ((passes / totalTests) * 100).toFixed(2)

        const BLUE = 'FF1b0091'
        const WHITE = 'FFFFFFFF'
        const GREEN_BG = 'FFc6efce'
        const GREEN_FG = 'FF006100'
        const RED_BG = 'FFffc7ce'
        const RED_FG = 'FF9c0006'
        const YELLOW_BG = 'FFffeb9c'
        const YELLOW_FG = 'FF9c6500'

        // Merge title row
        sheet.mergeCells('A1:G1')
        const titleCell = sheet.getCell('A1')
        titleCell.value = `StudyMind AI — ${this.platform === 'Web_Selenium' ? 'Selenium Web' : 'Appium Android'} QA Analysis Report`
        titleCell.font = { size: 16, bold: true, color: { argb: WHITE } }
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } }
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
        sheet.getRow(1).height = 36

        // Summary rows
        const summaryData = [
            ['Platform', this.platform === 'Web_Selenium' ? 'Web Browser (Selenium / Chrome)' : 'Android Mobile (Appium / Capacitor APK)'],
            ['Report Generated', new Date().toLocaleString()],
            ['Total Tests', totalTests],
            ['✅ Tests Passed', passes],
            ['❌ Tests Failed', fails],
            ['⚠️ Tests Skipped', skipped],
            ['🎯 Accuracy', `${accuracy}%`],
            ['Deployable Status', parseFloat(accuracy) >= 95 ? '✅ READY FOR DEPLOYMENT' : '⚠️ NEEDS REVIEW'],
        ]
        summaryData.forEach((row, i) => {
            const r = sheet.addRow(row)
            r.getCell(1).font = { bold: true }
            r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe8e8f0' } }
            if (row[0] === '🎯 Accuracy') {
                r.getCell(2).font = { bold: true, color: { argb: GREEN_FG } }
            }
            if (row[0] === 'Deployable Status') {
                const isReady = parseFloat(accuracy) >= 95
                r.getCell(2).font = { bold: true, color: { argb: isReady ? GREEN_FG : YELLOW_FG } }
                r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isReady ? GREEN_BG : YELLOW_BG } }
            }
        })

        // Spacer
        sheet.addRow([])

        // ── Table Header ─────────────────────────────────────
        const headerRow = sheet.addRow(['ID', 'Test Case Description', 'Category', 'Status', 'Duration', 'Timestamp', 'Notes'])
        headerRow.font = { bold: true, color: { argb: WHITE } }
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } }
        headerRow.height = 22

        // Set column widths
        sheet.columns = [
            { key: 'id', width: 8 },
            { key: 'title', width: 70 },
            { key: 'category', width: 22 },
            { key: 'status', width: 14 },
            { key: 'duration', width: 14 },
            { key: 'timestamp', width: 28 },
            { key: 'notes', width: 20 },
        ]

        // ── Test Data Rows ────────────────────────────────────
        const categoryMap: Record<string, string> = {
            'REQ-1': 'Authentication', 'REQ-2': 'Authentication', 'REQ-3': 'Authentication', 'REQ-4': 'Authentication',
            'REQ-5': 'Authentication', 'REQ-6': 'Authentication', 'REQ-7': 'Authentication', 'REQ-8': 'Authentication',
            'REQ-9': 'Authentication', 'REQ-10': 'Authentication', 'REQ-11': 'Authentication', 'REQ-12': 'Authentication',
            'REQ-13': 'Authentication', 'REQ-14': 'Authentication', 'REQ-15': 'Authentication',
            'REQ-16': 'Onboarding', 'REQ-17': 'Onboarding', 'REQ-18': 'Onboarding', 'REQ-19': 'Onboarding',
            'REQ-20': 'Onboarding', 'REQ-21': 'Onboarding', 'REQ-22': 'Onboarding',
            'REQ-23': 'Dashboard', 'REQ-24': 'Dashboard', 'REQ-25': 'Dashboard', 'REQ-26': 'Dashboard',
            'REQ-27': 'Dashboard', 'REQ-28': 'Dashboard', 'REQ-29': 'Dashboard', 'REQ-30': 'Dashboard',
            'REQ-31': 'Dashboard', 'REQ-32': 'Dashboard', 'REQ-33': 'Dashboard', 'REQ-34': 'Dashboard', 'REQ-35': 'Dashboard',
            'REQ-36': 'Library', 'REQ-37': 'Library', 'REQ-38': 'Library', 'REQ-39': 'Library', 'REQ-40': 'Library',
            'REQ-41': 'Library', 'REQ-42': 'Library', 'REQ-43': 'Library', 'REQ-44': 'Library', 'REQ-45': 'Library',
            'REQ-46': 'Library', 'REQ-47': 'Library', 'REQ-48': 'Library',
            'REQ-49': 'Task Board', 'REQ-50': 'Task Board', 'REQ-51': 'Task Board', 'REQ-52': 'Task Board',
            'REQ-53': 'Task Board', 'REQ-54': 'Task Board', 'REQ-55': 'Task Board', 'REQ-56': 'Task Board',
            'REQ-57': 'Task Board', 'REQ-58': 'Task Board', 'REQ-59': 'Task Board', 'REQ-60': 'Task Board',
            'REQ-61': 'Task Board', 'REQ-62': 'Task Board',
            'REQ-63': 'Study Rooms', 'REQ-64': 'Study Rooms', 'REQ-65': 'Study Rooms', 'REQ-66': 'Study Rooms',
            'REQ-67': 'Study Rooms', 'REQ-68': 'Study Rooms', 'REQ-69': 'Study Rooms', 'REQ-70': 'Study Rooms',
            'REQ-71': 'Study Rooms', 'REQ-72': 'Study Rooms', 'REQ-73': 'Study Rooms', 'REQ-74': 'Study Rooms',
            'REQ-75': 'Leaderboard', 'REQ-76': 'Leaderboard', 'REQ-77': 'Leaderboard', 'REQ-78': 'Leaderboard',
            'REQ-79': 'Leaderboard', 'REQ-80': 'Leaderboard', 'REQ-81': 'Leaderboard', 'REQ-82': 'Leaderboard',
            'REQ-83': 'Leaderboard', 'REQ-84': 'Leaderboard',
            'REQ-85': 'Flashcards & Notes', 'REQ-86': 'Flashcards & Notes', 'REQ-87': 'Flashcards & Notes',
            'REQ-88': 'Flashcards & Notes', 'REQ-89': 'Flashcards & Notes', 'REQ-90': 'Flashcards & Notes',
            'REQ-91': 'Flashcards & Notes', 'REQ-92': 'Flashcards & Notes', 'REQ-93': 'Flashcards & Notes',
            'REQ-94': 'Profile', 'REQ-95': 'Profile', 'REQ-96': 'Profile', 'REQ-97': 'Profile', 'REQ-98': 'Profile',
            'REQ-99': 'UI/UX', 'REQ-100': 'UI/UX', 'REQ-101': 'UI/UX', 'REQ-102': 'UI/UX',
            'REQ-103': 'UI/UX', 'REQ-104': 'UI/UX', 'REQ-105': 'UI/UX',
        }

        this.results.forEach(result => {
            const reqKey = result.title.split(':')[0].trim()
            const category = categoryMap[reqKey] || (reqKey.startsWith('REQ-M') ? 'Mobile' : 'General')
            const row = sheet.addRow([
                result.id,
                result.title,
                category,
                result.status.toUpperCase(),
                result.duration,
                result.timestamp,
                result.status === 'fail' ? 'Needs investigation' : 'Passed as expected',
            ])
            const statusCell = row.getCell(4)
            if (result.status === 'pass') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_BG } }
                statusCell.font = { bold: true, color: { argb: GREEN_FG } }
            } else if (result.status === 'fail') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED_BG } }
                statusCell.font = { bold: true, color: { argb: RED_FG } }
            }
            row.alignment = { wrapText: false, vertical: 'middle' }
        })

        // ── Save File ─────────────────────────────────────────
        const reportsDir = path.join(process.cwd(), 'reports')
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir)

        const fileName = `QA_Analysis_Report_${this.platform}_${Date.now()}.xlsx`
        const reportPath = path.join(reportsDir, fileName)
        await workbook.xlsx.writeFile(reportPath)

        console.log(`  ✅ Report saved → ${reportPath}`)
        console.log(`     Platform: ${this.platform} | Tests: ${totalTests} | Pass: ${passes} | Fail: ${fails} | Accuracy: ${accuracy}%\n`)
    }
}
