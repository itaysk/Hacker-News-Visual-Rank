import Foundation

class HackerNewsAPI {
    static let shared = HackerNewsAPI()
    private let baseURL = "https://hacker-news.firebaseio.com/v0"
    
    private init() {}
    
    func fetchTopStories() async throws -> [Int] {
        let url = URL(string: "\(baseURL)/topstories.json")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Int].self, from: data)
    }
    
    func fetchStory(id: Int) async throws -> Story {
        let url = URL(string: "\(baseURL)/item/\(id).json")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(Story.self, from: data)
    }
    
    func fetchTopStories(limit: Int = 30) async throws -> [Story] {
        let storyIDs = try await fetchTopStories()
        let limitedIDs = Array(storyIDs.prefix(limit))
        
        return try await withThrowingTaskGroup(of: (Int, Story).self) { group in
            for (index, id) in limitedIDs.enumerated() {
                group.addTask {
                    let story = try await self.fetchStory(id: id)
                    return (index, story)
                }
            }
            
            var stories: [(Int, Story)] = []
            for try await (index, story) in group {
                stories.append((index, story))
            }
            
            return stories.sorted { $0.0 < $1.0 }.map { $0.1 }
        }
    }
}
