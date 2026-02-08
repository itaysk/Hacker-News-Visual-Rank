import Foundation

struct Story: Codable, Identifiable {
    let id: Int
    let title: String
    let score: Int
    let by: String
    let time: TimeInterval
    let url: String?
    let descendants: Int?
    var fontSize: CGFloat?
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case score
        case by
        case time
        case url
        case descendants
    }
    
    var formattedTime: String {
        let date = Date(timeIntervalSince1970: time)
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}
