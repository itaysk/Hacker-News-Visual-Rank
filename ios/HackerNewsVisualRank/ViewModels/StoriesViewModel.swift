import Foundation
import SwiftUI

@MainActor
class StoriesViewModel: ObservableObject {
    @Published var stories: [Story] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let api = HackerNewsAPI.shared
    
    // Configuration matching the JavaScript version
    private let config = FontConfig(
        minFont: 10,
        maxFont: 30,
        defaultFont: 13.33,
        pointsWeight: 0.5,
        commentsWeight: 0.5
    )
    
    private struct FontConfig {
        let minFont: CGFloat
        let maxFont: CGFloat
        let defaultFont: CGFloat
        let pointsWeight: CGFloat
        let commentsWeight: CGFloat
    }
    
    nonisolated init() {
        Task { @MainActor in
            await self.loadStories()
        }
    }
    
    func loadStories() async {
        isLoading = true
        errorMessage = nil
        
        do {
            stories = try await api.fetchTopStories(limit: 30)
            calculateFontSizes()
        } catch {
            errorMessage = "Failed to load stories: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    func refresh() async {
        await loadStories()
    }
    
    func calculateFontSizes() {
        guard !stories.isEmpty else { return }
        
        // Calculate priority rankings for both points and comments
        let pointsRankings = calculatePriorityForPoints()
        let commentsRankings = calculatePriorityForComments()
        
        // Calculate final font sizes using weighted combination
        for i in 0..<stories.count {
            let pointsRank = pointsRankings[i]
            let commentsRank = commentsRankings[i]
            let finalSize = (pointsRank * config.pointsWeight) + (commentsRank * config.commentsWeight)
            stories[i].fontSize = finalSize
        }
    }
    
    private func calculatePriorityForPoints() -> [CGFloat] {
        let values = stories.map { $0.score }
        let min = CGFloat(values.min() ?? 0)
        let max = CGFloat(values.max() ?? 1)
        
        guard max > min else { return Array(repeating: config.defaultFont, count: stories.count) }
        
        return stories.map { story in
            let normalizedValue = CGFloat(story.score)
            let size = ((config.maxFont - config.minFont) * (normalizedValue - min) / (max - min)) + config.minFont
            return size
        }
    }
    
    private func calculatePriorityForComments() -> [CGFloat] {
        let values = stories.compactMap { $0.descendants }
        guard !values.isEmpty else { return Array(repeating: config.defaultFont, count: stories.count) }
        
        let min = CGFloat(values.min() ?? 0)
        let max = CGFloat(values.max() ?? 1)
        
        guard max > min else { return Array(repeating: config.defaultFont, count: stories.count) }
        
        return stories.map { story in
            guard let comments = story.descendants else { return config.defaultFont }
            let normalizedValue = CGFloat(comments)
            let size = ((config.maxFont - config.minFont) * (normalizedValue - min) / (max - min)) + config.minFont
            return size
        }
    }
    
    func calculateFontSize(for story: Story) -> CGFloat {
        return story.fontSize ?? config.defaultFont
    }
}
