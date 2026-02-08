import SwiftUI
#if os(iOS)
import SafariServices
#endif

enum SortOrder: String, CaseIterable {
    case date = "Date"
    case fontSize = "Rank"
}

struct ContentView: View {
    @StateObject private var viewModel: StoriesViewModel
    @State private var selectedURL: URL?
    @AppStorage("showDetails") private var showDetails = false
    @AppStorage("sortOrder") private var sortOrder: SortOrder = .date

    init(viewModel: StoriesViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }

    init() {
        _viewModel = StateObject(wrappedValue: StoriesViewModel())
    }

    private let hnOrange = Color(red: 1.0, green: 0.4, blue: 0.0)
    private let hnBackground = Color(red: 0xf6/255, green: 0xf6/255, blue: 0xef/255)

    var body: some View {
        VStack(spacing: 0) {
            // Custom header bar
            HStack {
                Image("YCLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 20)
                    .border(Color.white, width: 2)

                Spacer()

                Button {
                    withAnimation {
                        showDetails.toggle()
                    }
                } label: {
                    Image(systemName: showDetails ? "text.justify.leading" : "list.bullet")
                        .imageScale(.small)
                }

                Menu {
                    ForEach(SortOrder.allCases, id: \.self) { order in
                        Button {
                            sortOrder = order
                        } label: {
                            if sortOrder == order {
                                Label(order.rawValue, systemImage: "checkmark")
                            } else {
                                Text(order.rawValue)
                            }
                        }
                    }
                } label: {
                    Image(systemName: "arrow.up.arrow.down")
                        .imageScale(.small)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .foregroundStyle(.white)
            .background {
                hnOrange.ignoresSafeArea(edges: .top)
            }

            // Content
            Group {
                if viewModel.isLoading && viewModel.stories.isEmpty {
                    ProgressView("Loading stories...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = viewModel.errorMessage {
                    ErrorView(message: errorMessage) {
                        Task { await viewModel.refresh() }
                    }
                } else if viewModel.stories.isEmpty {
                    ContentUnavailableView(
                        "No Stories",
                        systemImage: "newspaper",
                        description: Text("Pull to refresh or tap the refresh button.")
                    )
                } else {
                    List(sortedStories) { story in
                        StoryRow(
                            story: story,
                            fontSize: viewModel.calculateFontSize(for: story),
                            showDetails: showDetails
                        )
                        .contentShape(Rectangle())
                        .onTapGesture {
                            if let urlString = story.url,
                               let url = URL(string: urlString) {
                                openURL(url)
                            }
                        }
                        .listRowBackground(hnBackground)
                        .alignmentGuide(.listRowSeparatorLeading) { _ in 0 }
                        .alignmentGuide(.listRowSeparatorTrailing) { d in d[.trailing] }
                        .contextMenu {
                            Button {
                                let commentsURL = URL(string: "https://news.ycombinator.com/item?id=\(story.id)")!
                                openURL(commentsURL)
                            } label: {
                                Label("View Comments", systemImage: "bubble.right")
                            }
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    .background(hnBackground)
                    .refreshable {
                        await viewModel.refresh()
                    }
                }
            }
        }
        .background(hnBackground.ignoresSafeArea())
        #if os(iOS)
        .sheet(item: $selectedURL) { url in
            SafariView(url: url)
                .ignoresSafeArea()
        }
        #endif
    }

    private var sortedStories: [Story] {
        switch sortOrder {
        case .date:
            return viewModel.stories
        case .fontSize:
            return viewModel.stories.sorted {
                viewModel.calculateFontSize(for: $0) > viewModel.calculateFontSize(for: $1)
            }
        }
    }

    private func openURL(_ url: URL) {
        #if os(iOS)
        selectedURL = url
        #elseif os(macOS)
        NSWorkspace.shared.open(url)
        #endif
    }
}

// MARK: - Error View

private struct ErrorView: View {
    let message: String
    let onRetry: () -> Void

    var body: some View {
        ContentUnavailableView {
            Label("Something Went Wrong", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message)
        } actions: {
            Button("Try Again") {
                onRetry()
            }
            .buttonStyle(.bordered)
        }
    }
}

// MARK: - Safari View

#if os(iOS)
struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
#endif

// MARK: - URL Identifiable Conformance

extension URL: @retroactive Identifiable {
    public var id: String { absoluteString }
}

#Preview {
    MainActor.assumeIsolated {
        ContentView(viewModel: PreviewStoriesViewModel.create())
    }
}

class PreviewStoriesViewModel: StoriesViewModel {
    @MainActor
    static func create() -> PreviewStoriesViewModel {
        let viewModel = PreviewStoriesViewModel()
        viewModel.stories = [
            Story(id: 1, title: "Show HN: A visual way to browse Hacker News", score: 150, by: "user1", time: Date().timeIntervalSince1970 - 3600, url: "https://example.com", descendants: 25),
            Story(id: 2, title: "Ask HN: What are you working on?", score: 75, by: "user2", time: Date().timeIntervalSince1970 - 7200, url: nil as String?, descendants: 120),
            Story(id: 3, title: "Rust vs Go for systems programming in 2025", score: 200, by: "user3", time: Date().timeIntervalSince1970 - 600, url: "https://example.com", descendants: 50)
        ]
        viewModel.calculateFontSizes()
        return viewModel
    }
    
    override init() {
        super.init()
    }
    
    override func refresh() async {
        // Mock refresh for preview
    }
}

